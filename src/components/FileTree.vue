
<template>
    <div class="card">
        <div class="flex flex-wrap gap-2 mb-6">
            <Button type="button" icon="pi pi-plus" label="Expand All" @click="expandAll" />
            <Button type="button" icon="pi pi-minus" label="Collapse All" @click="collapseAll" />
            <Button type="button" icon="pi pi-folder-plus" label="New Folder" @click="addFolderToSelected" />
            <Button type="button" icon="pi pi-folder-plus" label="New Canvas" @click="addCanvasToSelected" />
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
                <div class="flex align-items-center gap-2 norowrap">
                    <span>{{ slotProps.node.label }}</span>
                    <Button v-if="slotProps.node.showButton" icon="pi pi-trash" class="p-button-text red-400" style="color: var(--red-400)" @click.stop="removeNode(slotProps.node)" />
                </div>
            </template>
        </Tree>
    </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { NodeService } from '@/service/NodeService';


const selectedKey = ref({});
const lastSelectedNode = ref(null); // Saugosime paskutinį pasirinktą elementą
const expandedKeys = ref({'0': true, '0-0': true}); // Pradžioje išskleidžiame kelis katalogus
const onTreeClick = (event) => {
  // Jei paspaudėte ant folderio ar failo (p-tree-node-content), nieko nedarykite
  if (event.target.closest('.p-tree-node-content')) return;
  selectedKey.value = {};
};

let idCounter = 100; // Unikaliems raktams kurti

const nodes = ref([]);

// --- Metodai ---

// Funkcija prideda naują katalogą tiesiai į nurodytą tėvinį elementą (parent node)
const addFolderInline = (parentNode) => {
    const newFolder = {
        key: `${idCounter++}`,           // Unikalus raktas
        parentKey: parentNode.key,
        label: 'New Folder',
        icon: 'pi pi-fw pi-folder',
        showButton: true,
        children: [],
    };
    parentNode.children.push(newFolder);
    expandedKeys.value[parentNode.key] = true;
};

const addCanvasInline = (parentNode) => {
    const newCanvas = {
        key: `${idCounter++}`,           // Unikalus raktas
        parentKey: parentNode.key,
        label: 'New Canvas',
        icon: 'pi pi-fw pi-file'
    };
    parentNode.children.push(newCanvas);
    expandedKeys.value[parentNode.key] = true;
};

// Funkcija prideda katalogą prie pažymėto folderio
const addFolderToSelected = () => {
    // Surandame pažymėtą folderį
    const selectedKeyValue = Object.keys(selectedKey.value)[0];
    if (!selectedKeyValue) {
        const newRootFolder = {
            key: `${idCounter++}`,
            label: 'New Folder',
            icon: 'pi pi-fw pi-folder',
            children: [],
        };
        nodes.value.push(newRootFolder);
        return;
    }
    // Surandame node pagal key
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
        addFolderInline(selectedNode);
    }
};

const addCanvasToSelected = () => {
    // Surandame pažymėtą folderį
    const selectedKeyValue = Object.keys(selectedKey.value)[0];
    if (!selectedKeyValue) {
        const newRootCanvas = {
            key: `${idCounter++}`,
            label: 'New Canvas',
            icon: 'pi pi-fw pi-file'
        };
        nodes.value.push(newRootCanvas);
        return;
    }
    // Surandame node pagal key
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
        addCanvasInline(selectedNode);
    }
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

onMounted(() => {
    NodeService.getTreeNodes().then((data) => (nodes.value = data));
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
