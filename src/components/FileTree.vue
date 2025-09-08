<template>
    <div class="top-name-container">
        <Button
          icon="pi pi-trash"
          class="button-trash"
          @click="sidebarVisible = true"
        />
        <Button
          icon="pi pi-cog"
          class="button-cog"
          @click="sidebarVisible = true"
        />
        <Button
          icon="pi pi-user"
          class="button-profile"
          @click.stop="addFolderInline(slotProps.node)" 
        />
    </div>
    <div class="card">
        <div class="flex flex-wrap gap-2 mb-6">
            <Button type="button" icon="pi pi-plus" label="Expand All" @click="expandAll" />
            <Button type="button" icon="pi pi-minus" label="Collapse All" @click="collapseAll" />
            <Button type="button" icon="pi pi-folder-plus" label="New Folder" @click="addFolderToSelected" />
            <Button type="button" icon="pi pi-file-plus" label="New Canvas" @click="addCanvasToSelected" />
        </div>
        <Tree 
            v-model:selectionKeys="selectedKey"
            v-model:expandedKeys="expandedKeys"
            :value="nodes"
            selectionMode="multiple"
            :metaKeySelection="true"
            @nodeSelect="onNodeSelect"
            @nodeUnselect="onNodeUnselect"
            @nodeExpand="onNodeExpand"
            @nodeCollapse="onNodeCollapse"
            @click="onTreeClick"
            :filter="true"
            filterMode="lenient"
            class="w-full md:w-[30rem]">

            
            <template #default="slotProps">
                <div class="flex align-items-center gap-2 norowrap"
                     @mouseover="hover = slotProps.node.key"
                     @mouseleave="hover = null"
                     >
                    <span v-if="editingKey !== slotProps.node.key">{{ slotProps.node.label }}</span>
                    
                    <div
                        class="hover-show"
                        v-show="hover === slotProps.node.key || editingKey === slotProps.node.key"
                    >
                        <input
                            v-show="editingKey === slotProps.node.key"
                            v-model="slotProps.node.label"
                            ref="renameInput"
                            @blur="onRenameConfirm(slotProps.node)"
                            @keyup.enter="onRenameConfirm(slotProps.node)"
                        />
                        <Checkbox
                            class="button-checkbox"
                            v-model="slotProps.node.checked"
                            binary
                            size="small"
                        />
                        <Button
                            v-if="slotProps.node.showButton && slotProps.node.icon === 'pi pi-fw pi-folder'"
                            icon="pi pi-folder-plus"
                            class="p-button-text green-400"
                            style="color: var(--green-400)"
                            @click.stop="addFolderInline(slotProps.node)"
                        />
                        <Button
                            v-if="slotProps.node.showButton && slotProps.node.icon === 'pi pi-fw pi-folder'"
                            icon="pi pi-file-plus"
                            class="p-button-text green-400"
                            style="color: var(--green-400)"
                            @click.stop="addCanvasInline(slotProps.node)"
                        />
                        <Button
                            v-if="slotProps.node.showButton"
                            icon="pi pi-pencil"
                            class="p-button-text yellow-400"
                            style="color: var(--yellow-400)"
                            @click.stop="editNode(slotProps.node)"
                        />
                        <Button
                            v-if="slotProps.node.showButton"
                            icon="pi pi-trash"
                            class="p-button-text red-400"
                            style="color: var(--red-400); font-size: 0.875rem"
                            @click.stop="removeNode(slotProps.node)"
                        />
                    </div>
                    <div>
                        <Rating v-model="slotProps.node.rating" />
                    </div>
                </div>
                
            </template>
            
        </Tree>
    </div>
    <Sidebar v-model:visible="sidebarVisible" position="right">
        <!-- Content inside the drawer -->
        <h2>Sidebar Content</h2>
        <p>This is your drawer from the right!</p>
    </Sidebar>
</template>


<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { NodeService } from '@/service/NodeService';

import Rating from 'primevue/rating';
import Sidebar from 'primevue/sidebar';

import { db } from '@/firebase';

import { doc, deleteDoc } from 'firebase/firestore';

// Funkcija prideda naują katalogą tiesiai į nurodytą tėvinį elementą (parent node)
import { collection, addDoc, getDocs } from 'firebase/firestore';

const selectedKey = ref({});
const lastSelectedNode = ref(null); // Saugosime paskutinį pasirinktą elementą
const expandedKeys = ref({'0': true, '0-0': true}); // Pradžioje išskleidžiame kelis katalogus
const onTreeClick = (event) => {
  // Jei paspaudėte ant folderio ar failo (p-tree-node-content), nieko nedarykite
  if (event.target.closest('.p-tree-node-content')) return;
  selectedKey.value = {};
};

const editingKey = ref(null);
const renameInput = ref(null);

// const value = ref(null); // Saugojame įvertinimą


const nodes = ref([]); // Saugojame visus medžio mazgus

const hover = ref(null); // Saugojame šiuo metu užvesdami pelės rodyklę mazgo raktą

const newFolderName = ref('');
const newCanvasName = ref('');

// Automatinis teksto pažymėjimas kai tik pasikeičia editingKey
watch(editingKey, async (newKey) => {
  if (newKey) {
    let tries = 0;
    const trySelect = () => {
      if (renameInput.value) {
        renameInput.value.select();
      } else if (tries < 10) {
        tries++;
        setTimeout(trySelect, 30);
      }
    };
    trySelect();
  }
});

// --- Metodai ---

// Funkcija nuskaito folderius iš Firestore
async function getFolders() {
    const querySnapshot = await getDocs(collection(db, "folders"));
    const folders = [];
    querySnapshot.forEach((doc) => {
        folders.push({ key: doc.id, ...doc.data() });
    });
    return folders;
}

async function getCanvases() {
  const querySnapshot = await getDocs(collection(db, "canvases"));
  const canvases = [];
  querySnapshot.forEach((doc) => {
    canvases.push({ key: doc.id, ...doc.data() });
  });
  return canvases;
}

// Funkcija įrašo folderį į Firestore
async function addFolder(folderData) {
    try {
        const docRef = await addDoc(collection(db, "folders"), folderData);
        // Sėkmingai įrašyta, docRef.id yra sugeneruotas Firebase ID
        return docRef.id;
    } catch (e) {
        console.error("Klaida įrašant folderį:", e);
        return null;
    }
}

// Funkcija įrašo canvas į Firestore
async function addCanvas(canvasData) {
    try {
        const docRef = await addDoc(collection(db, "canvases"), canvasData);
        return docRef.id;
    } catch (e) {
        console.error("Klaida įrašant canvas:", e);
        return null;
    }
}



// 4. Pridėti folderį į pasirinktą node arba kaip root (tik UI, ne DB)
const addFolderToSelected = () => {
    const selectedKeyValue = Object.keys(selectedKey.value)[0];
    const tempKey = 'temp-' + Date.now();
    const folderData = {
        label: '',
        icon: 'pi pi-fw pi-folder',
        showButton: true,
        parentKey: selectedKeyValue || null,
        rating: 0,
        children: [],
        key: tempKey,
        isPending: true
    };
    if (!selectedKeyValue) {
        nodes.value.push(folderData);
    } else {
        expandedKeys.value[selectedKeyValue] = true;
        const findNode = (nodesArr, key) => {
            for (const node of nodesArr) {
                if (node.key === key) return node;
                if (node.children) {
                    const found = findNode(node.children, key);
                    if (found) return found;
                }
            }
            return null;
        };
        const selectedNode = findNode(nodes.value, selectedKeyValue);
        if (selectedNode && Array.isArray(selectedNode.children)) {
            selectedNode.children.push(folderData);
        }
    }
    editingKey.value = tempKey;
};

// 5. Pridėti canvas į pasirinktą node arba kaip root (tik UI, ne DB)
const addCanvasToSelected = () => {
    const selectedKeyValue = Object.keys(selectedKey.value)[0];
    const tempKey = 'temp-' + Date.now();
    const canvasData = {
        label: '',
        icon: 'pi pi-fw pi-file',
        showButton: true,
        parentKey: selectedKeyValue || null,
        rating: 0,
        key: tempKey,
        isPending: true
    };
    if (!selectedKeyValue) {
        nodes.value.push(canvasData);
    } else {
        expandedKeys.value[selectedKeyValue] = true;
        const findNode = (nodesArr, key) => {
            for (const node of nodesArr) {
                if (node.key === key) return node;
                if (node.children) {
                    const found = findNode(node.children, key);
                    if (found) return found;
                }
            }
            return null;
        };
        const selectedNode = findNode(nodes.value, selectedKeyValue);
        if (selectedNode && Array.isArray(selectedNode.children)) {
            selectedNode.children.push(canvasData);
        }
    }
    editingKey.value = tempKey;
};

// Patvirtinus pavadinimą (Enter/blur), įrašyti į Firestore
const onRenameConfirm = async (node) => {
    if (node.isPending && node.label.trim()) {
        const data = { ...node };
        delete data.key;
        delete data.isPending;
        let id;
        if (node.icon === 'pi pi-fw pi-folder') {
            id = await addFolder(data);
        } else {
            id = await addCanvas(data);
        }
        if (id) {
            node.key = id;
            node.isPending = false;
        }
    }
    editingKey.value = null;
};

// Šablone input: žiūrėkite template dalį

// 6. Inline folder/canvas kūrimas (naudokite tik jei norite iškart įrašyti į Firestore)
const addFolderInline = async (parentNode) => {
    const folderData = {
        parentKey: parentNode.key,
        label: 'New Folder',
        icon: 'pi pi-fw pi-folder',
        showButton: true,
        rating: 0,
        children: [],
    };
    const id = await addFolder(folderData);
    if (id) {
        const newFolder = { ...folderData, key: id };
        if (!Array.isArray(parentNode.children)) {
            parentNode.children = [];
        }
        parentNode.children.push(newFolder);
        expandedKeys.value[parentNode.key] = true;
        editingKey.value = newFolder.key;
    }
};

const addCanvasInline = async (parentNode) => {
    const canvasData = {
        parentKey: parentNode.key,
        label: 'New Canvas',
        icon: 'pi pi-fw pi-file',
        showButton: true,
        rating: 0,
    };
    const id = await addCanvas(canvasData);
    if (id) {
        const newCanvas = { ...canvasData, key: id };
        if (!Array.isArray(parentNode.children)) {
            parentNode.children = [];
        }
        parentNode.children.push(newCanvas);
        expandedKeys.value[parentNode.key] = true;
        editingKey.value = newCanvas.key;
    }
};

// 7. Trinant naudokite key (Firebase ID)
const removeNode = async (node) => {
    await deleteDoc(doc(db, "folders", node.key));
    function recursiveRemove(arr, key) {
        for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i].key === key) {
                arr.splice(i, 1);
            } else if (arr[i].children) {
                recursiveRemove(arr[i].children, key);
            }
        }
    }
    recursiveRemove(nodes.value, node.key);
};

// Paspaudus mygtuką, sustabdome evento plitimą, kad nebūtų išskleistas/suskleistas katalogas
const onAddButtonClick = (event, node) => {
    event.stopPropagation();
    addFolderInline(node);
};

const onNodeSelect = () => {};
const onNodeUnselect = () => {};
const onNodeExpand = () => {};
const onNodeCollapse = () => {};



onMounted(async () => {
    // Užkraunam folderius ir canvas failus iš Firestore
    const folders = await getFolders();
    const canvases = await getCanvases();

    // Priskirti canvas failus prie teisingų folderių pagal parentKey
    folders.forEach(folder => {
        folder.children = [];
    });
    canvases.forEach(canvas => {
        const parentFolder = folders.find(f => f.key === canvas.parentKey);
        if (parentFolder) {
            parentFolder.children.push(canvas);
        }
    });

    // Rekursyviai sukurti medį iš plokščio folderių masyvo
    function buildTree(flatFolders, parentKey = null) {
        return flatFolders
            .filter(folder => folder.parentKey === parentKey)
            .map(folder => ({
                ...folder,
                children: [
                    ...folder.children,
                    ...buildTree(flatFolders, folder.key)
                ]
            }));
    }

    // Surinkti root canvas (be parentKey)
    const rootCanvases = canvases.filter(canvas => !canvas.parentKey);

    // Įdėti root folderius ir root canvas į medį
    nodes.value = [...buildTree(folders), ...rootCanvases];
    console.log('nodes:', nodes.value);

    // Pridėti globalų click eventą
    document.addEventListener('click', (event) => {
        if (event.target.closest('.p-tree-node-content')) return;
        selectedKey.value = {};
    });
});

const expandAll = () => {
    for (let node of nodes.value) {
        expandNode(node);
    }

    expandedKeys.value = { ...expandedKeys.value };
};

const collapseAll = () => {
    expandedKeys.value = {};
};

const expandNode = (node) => {
    if (node.children && node.children.length) {
        expandedKeys.value[node.key] = true;

        for (let child of node.children) {
            expandNode(child);
        }
    }
};
</script>
