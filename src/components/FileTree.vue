<template>
        <div class="top-name-container">
                <Button
                    icon="pi pi-trash"
                    class="button-trash"
                    @click="sidebarTrashVisible = true"
                />
                <Button
                    icon="pi pi-cog"
                    class="button-cog"
                    @click="sidebarCogVisible = true"
                />
                <Button
                    icon="pi pi-user"
                    class="button-profile"
                    @click.stop="addFolderInline(slotProps.node)" 
                />
        </div>

    <div class="card">

        <InputText 
          v-model="filtertree"
          placeholder="Search..."
          class="search-input" 
        />
        
                  <!-- Expand/Collapse/Add ---------------------------->
        <div class="flex flex-wrap gap-2 mb-6">
            <Button type="button" icon="pi pi-plus" label="Expand All" @click="expandAll" />
            <Button type="button" icon="pi pi-minus" label="Collapse All" @click="collapseAll" />
            <Button type="button" icon="pi pi-folder-plus" label="New Folder" @click="addFolderToSelected" />
            <Button type="button" icon="pi pi-file-plus" label="New Canvas" @click="addCanvasToSelected" />
        </div>

            <!-- SORT BUTTONS ---------------------------->

        <div class="tree-toolbar">
            SORT:
            <Button label="A-Z" @click="sortBy('label')" />
            <Button label="Rating" @click="sortBy('rating')" />
            <Button label="Reverse" @click="sortBy('reverse')" />
            <!-- Galite pridėti Dropdown su daugiau pasirinkimų -->
        </div>

            <!-- File Tree ---------------------------->
        <Tree 
          v-model:selectionKeys="selectedKey"
          v-model:expandedKeys="expandedKeys"
          :value="filteredNodes"
          selectionMode="multiple"
          :metaKeySelection="true"
          @nodeSelect="onNodeSelect"
          @nodeUnselect="onNodeUnselect"
          @nodeExpand="onNodeExpand"
          @nodeCollapse="onNodeCollapse"
          @click="onTreeClick"
          class="w-full md:w-[30rem]">


              <template #default="slotProps">

                  <div class="p-tree-node-content p-tree-node-selectable"
                      @mouseover="hover = slotProps.node.key"
                      @mouseleave="hover = null"
                      @contextmenu.prevent="onRightClick"
                    >


                      <div class="flex align-items-center gap-2 norowrap">


                          <Icon :icon="slotProps.node.icon" :style="{ color: slotProps.node.iconColor || '#fff', fontSize: '1.2em' }" />
                          <span v-if="editingKey !== slotProps.node.key">{{ slotProps.node.label }}</span>


                          
                          
                          <div
                              class="element-buttons-row"    
                          >

                              <!--New Element Rename ----------------------------->

                              <input
                                  v-if="editingKey === slotProps.node.key"
                                  v-model="slotProps.node.label"
                                  ref="renameInput"
                                  @blur="onRenameConfirm(slotProps.node)"
                                  @keyup.enter="onRenameConfirm(slotProps.node)"
                              />

                              <!--Rating ----------------------------------------->

                          </div>
                              <Rating v-model="slotProps.node.rating" @change="updateRating(slotProps.node)" />

                              <!--Element Buttons ----------------------------->

                          <div 
                              class="element-buttons"
                              v-show="hover === slotProps.node.key || editingKey === slotProps.node.key">
                              
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
                      
                      </div>
                  </div>
                  
                  
              </template>
              
          </Tree>
    </div>

    <!-- Sidebars -->

    <Sidebar v-model:visible="sidebarCogVisible" position="right" style="width: 80vw;">
        <SidebarCog />
    </Sidebar>
    <Sidebar v-model:visible="sidebarTrashVisible" position="right" style="width: 80vw;">
        <SidebarTrash @itemRestored="reloadTree" />
    </Sidebar>

    <IconPickerModal
      :visible="showIconModal"
      :icons="['pi pi-home', 'pi pi-folder', 'pi pi-file']"
      @update:visible="showIconModal = $event"
      @select="icon => selectedIcon = icon"
    />

    <ContextMenuFileTree
      ref="contextMenuRef"
      @openIconPicker="showIconModal = true"
    />

</template>


<script setup>
import { ref, computed, onMounted, nextTick, watch, provide } from 'vue';
import { NodeService } from '@/service/NodeService';

import SidebarCog from './SidebarCog.vue';
import SidebarTrash from './SidebarTrash.vue';

import { Icon } from '@iconify/vue'


import Rating from 'primevue/rating';
import Sidebar from 'primevue/sidebar';

import { db } from '@/firebase';

import { doc, deleteDoc, updateDoc } from 'firebase/firestore';

// Funkcija prideda naują katalogą tiesiai į nurodytą tėvinį elementą (parent node)
import { collection, addDoc, getDocs } from 'firebase/firestore';

//  Context menu komponentas
import ContextMenuFileTree from './ContextMenuFileTree.vue'
const contextMenuRef = ref(null)

const showIconModal = ref(false)
const selectedIcon = ref('')

const filtertree = ref(''); // Saugojame filtro reikšmę SERACHAS
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

const sidebarCogVisible = ref(false);
const sidebarTrashVisible = ref(false);

const trashItems = ref([]); // globalus šiukšlinės masyvas
provide('trashItems', trashItems); // padarome prieinamą vaikams

// const value = ref(null); // Saugojame įvertinimą


const nodes = ref([]); // Saugojame visus medžio mazgus

const hover = ref(null); // Saugojame šiuo metu užvesdami pelės rodyklę mazgo raktą

const newFolderName = ref('');
const newCanvasName = ref('');

const filteredNodes = computed(() => {
  if (!filtertree.value) return nodes.value;
  // Rekursyviai filtruokite nodes pagal label
  function filterTree(nodes) {
    return nodes
      .map(node => {
        if (node.label && node.label.toLowerCase().includes(filtertree.value.toLowerCase())) {
          return node;
        }
        if (node.children) {
          const filteredChildren = filterTree(node.children);
          if (filteredChildren.length) {
            return { ...node, children: filteredChildren };
          }
        }
        return null;
      })
      .filter(Boolean);
  }
  return filterTree(nodes.value);
});

// Automatinis teksto pažymėjimas kai tik pasikeičia editingKey
watch(editingKey, async (newKey) => {
  if (newKey) {
    await nextTick();
    if (renameInput.value) {
      renameInput.value.focus();
      renameInput.value.select();
    }
  }
});

// Watcher, kuris stebi filtertree reikšmę
watch(filtertree, (val) => {
  if (val) {
    expandAll();
  } else {
    collapseAll();
  }
});

  // Surasti visus tėvinius key
  function findParentKeys(nodes, key, parents = []) {
    for (const node of nodes) {
      if (node.children) {
        if (node.children.some(child => child.key === key)) {
          parents.push(node.key);
          findParentKeys(nodes, node.key, parents);
        } else {
          for (const child of node.children) {
            findParentKeys([child], key, parents);
          }
        }
      }
    }
    return parents;
  }



async function updateRating(node) {
  let collectionName = node.icon === 'pi pi-fw pi-folder' ? 'folders' : 'canvases';
  try {
    await updateDoc(doc(db, collectionName, node.key), { rating: node.rating });
  } catch (e) {
    console.error('Klaida atnaujinant rating:', e);
  }
}

// --- Metodai ---


function onRightClick(event) {
  if (contextMenuRef.value && contextMenuRef.value.show) {
    contextMenuRef.value.show(event)
  } else {
    console.warn('ContextMenu ref is not ready');
  }
}

async function moveToTrash(node) {
  // Įrašyti į trash kolekciją
  await addDoc(collection(db, "deletedItems"), node);
  // Ištrinti iš pagrindinės kolekcijos
  const collectionName = node.icon === 'pi pi-fw pi-folder' ? 'folders' : 'canvases';
  await deleteDoc(doc(db, collectionName, node.key));
  // Pašalinti iš lokalaus medžio
  recursiveRemove(nodes.value, node.key);
}

// Rekursyvus šalinimas iš medžio pagal key
function recursiveRemove(arr, key) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i].key === key) {
      arr.splice(i, 1);
    } else if (arr[i].children) {
      recursiveRemove(arr[i].children, key);
    }
  }
}

// 0. Gauti kelią iki root (naudojama filtruojant)
function getPathToRoot(nodeKey, nodesArr) {
  const path = [];
  let current = nodesArr.find(n => n.key === nodeKey);
  while (current && current.parentKey) {
    const parent = nodesArr.find(n => n.key === current.parentKey);
    if (parent) path.unshift(parent);
    current = parent;
  }
  return path;
}

// 1. Rūšiavimas
function sortBy(type) {
  if (type === 'label') {
    nodes.value.sort((a, b) => a.label.localeCompare(b.label));
  } else if (type === 'rating') {
    nodes.value.sort((a, b) => b.rating - a.rating);
  } else if (type === 'reverse') {
    nodes.value.reverse();
  }
  // Jei turite children, rekursyviai rūšiuokite ir juos
}



// Funkcija, kuri pradeda pervadinimą (rodo input)
function editNode(node) {
    editingKey.value = node.key;
}

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

// reloadTree funkcija
async function reloadTree() {
  const folders = await getFolders();
  const canvases = await getCanvases();

  folders.forEach(folder => {
    folder.children = [];
  });
  canvases.forEach(canvas => {
    const parentFolder = folders.find(f => f.key === canvas.parentKey);
    if (parentFolder) {
      parentFolder.children.push(canvas);
    }
  });

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

  const rootCanvases = canvases.filter(canvas => !canvas.parentKey);
  nodes.value = [...buildTree(folders), ...rootCanvases];
  console.log('Medis atnaujintas, nodes:', nodes.value);
}

async function updateNodeIconAndColor(node) {
  let collectionName = node.icon === 'mdi:folder' ? 'folders' : 'canvases';
  try {
    await updateDoc(doc(db, collectionName, node.key), {
      icon: node.icon,
      iconColor: node.iconColor
    });
  } catch (e) {
    console.error('Klaida atnaujinant ikoną ar spalvą:', e);
  }
}

function onIconSelected({ icon, color }) {
  if (selectedNode.value) {
    selectedNode.value.icon = icon
    selectedNode.value.iconColor = color
    updateNodeIconAndColor(selectedNode.value)
  }
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
const addFolderToSelected = async () => {
  const selectedKeyValue = Object.keys(selectedKey.value)[0];
  const folderData = {
    label: 'New Folder',
    icon: 'mdi:folder',
    iconColor: '#1976d2',
    showButton: true,
    parentKey: selectedKeyValue || null,
    rating: 0,
    children: [],
  };
  // Iškart įrašom į Firebase
  const docRef = await addDoc(collection(db, "folders"), folderData);
  folderData.key = docRef.id;

  // Pridedam į UI
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

  // Įjungiam pervadinimo režimą
  editingKey.value = folderData.key;
  await nextTick();
  if (renameInput.value) {
    renameInput.value.focus();
    renameInput.value.select();
  }
};

// 5. Pridėti canvas į pasirinktą node arba kaip root (tik UI, ne DB)
const addCanvasToSelected = () => {
    const selectedKeyValue = Object.keys(selectedKey.value)[0];
    const tempKey = 'temp-' + Date.now();
    const canvasData = {
        label: 'New Canvas',
        icon: 'mdi:file',
        iconColor: '#1976d2',
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



const onRenameConfirm = async (node) => {
    // Jei tai naujas node (isPending), įrašyti į Firestore
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
    } else if (!node.isPending && node.label.trim()) {
        // Jei node jau egzistuoja, atnaujinti label Firestore
        let collectionName = node.icon === 'pi pi-fw pi-folder' ? 'folders' : 'canvases';
        try {
            await updateDoc(doc(db, collectionName, node.key), { label: node.label });
        } catch (e) {
            console.error('Klaida atnaujinant pavadinimą:', e);
        }
    }
    editingKey.value = null;
};


// 6. Inline folder/canvas kūrimas (naudokite tik jei norite iškart įrašyti į Firestore)
const addFolderInline = async (parentNode) => {
    const folderData = {
        parentKey: parentNode.key,
        label: 'New Folder',
        icon: 'mdi:folder',
        iconColor: '#1976d2',
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
        iconColor: '#1976d2',
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
  // Surinkite papildomą info: kelią iki root, brolius, vaikus
  function getPathToRoot(nodeKey, nodesArr) {
    const path = [];
    let current = nodesArr.find(n => n.key === nodeKey);
    while (current && current.parentKey) {
      const parent = nodesArr.find(n => n.key === current.parentKey);
      if (parent) path.unshift(parent);
      current = parent;
    }
    return path;
  }
  const pathToRoot = getPathToRoot(node.key, nodes.value);

  // Surinkti brolius
  const parent = nodes.value.find(n => n.key === node.parentKey);
  const siblings = parent ? parent.children.filter(child => child.key !== node.key) : [];

  // Surinkti vaikus
  const children = node.children || [];

  // Debug log: ką trini
  console.log('DEBUG: Trinu iš kolekcijos:', node.icon === 'pi pi-fw pi-folder' ? 'folders' : 'canvases', 'ID:', node.key);
  const collectionName = node.icon === 'pi pi-fw pi-folder' ? 'folders' : 'canvases';
  console.log('DEBUG: Kolekcijos pavadinimas:', collectionName);
  console.log('DEBUG: Key tipas:', typeof node.key, 'Key:', node.key);

  // Patikrinam ar dokumentas egzistuoja prieš trynimą
  try {
    const docRef = doc(db, collectionName, node.key);
    const docSnap = await getDocs(collection(db, collectionName));
    const exists = Array.from(docSnap.docs).some(d => d.id === node.key);
    console.log('DEBUG: Dokumentas egzistuoja:', exists);
  } catch (e) {
    console.error('DEBUG: Klaida tikrinant dokumento egzistavimą:', e);
  }

  // Įrašyti į deletedItems kolekciją su pilna info
  try {
    await addDoc(collection(db, "deletedItems"), {
      ...node,
      pathToRoot,
      siblings,
      children
    });
    console.log('DEBUG: Įrašyta į deletedItems kolekciją');
  } catch (e) {
    console.error('DEBUG: Klaida įrašant į deletedItems:', e);
  }

  // Ištrinti iš pagrindinės kolekcijos tik jei key nėra laikinas
  if (!String(node.key).startsWith('temp-')) {
    try {
      console.log('DEBUG: Bandau trinti dokumentą:', node.key, 'iš kolekcijos:', collectionName);
      await deleteDoc(doc(db, collectionName, node.key));
      console.log('DEBUG: Bandymas baigtas, deleteDoc įvykdytas');
    } catch (e) {
      console.error('DEBUG: Klaida trynimo metu:', e);
    }
  } else {
    console.log('DEBUG: Key laikinas, trynimas praleistas');
  }

  // Pašalinti iš lokalaus medžio
  recursiveRemove(nodes.value, node.key);
  console.log('DEBUG: Pašalinta iš lokalaus medžio');

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


