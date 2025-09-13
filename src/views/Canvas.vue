<template>
  <div class="canvas-viewport" ref="viewportRef">
    <!-- ContextMenuCanvas turi būti čia, tiesiogiai po .canvas-viewport -->
    <!-- ContextMenuCanvas emituoja 'add-element', gaunam eventą ir kviečiam handleAddElement -->
    <ContextMenuCanvas
      :visible="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      @add-element="handleAddElement"
      @pan-to-menu="handlePanToMenuPosition"
      @close="contextMenuVisible = false"
    />

    <div
      class="canvas-scene"
      ref="sceneRef"
      @click="onCanvasClick"
      @contextmenu.prevent="onCanvasContextMenu"
    >
      <CanvasElement
        v-for="element in elements"
        :key="element.id"
        :id="element.id"
        :x="element.x + (sceneRef?.value?.offsetWidth ? sceneRef.value.offsetWidth / 2 : 500)"
        :y="element.y + (sceneRef?.value?.offsetHeight ? sceneRef.value.offsetHeight / 2 : 500)"
        :width="element.width"
        :height="element.height"
        :isActive="activeElementId === element.id"
        :content="element.content"
        @update="handleElementUpdate"
      />
    </div>

    <div>
      TEST: {{ elements }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { nextTick } from 'vue';
import Panzoom from '@panzoom/panzoom';
import { useRoute } from 'vue-router'
const route = useRoute()
const canvasId = route.params.id

import CanvasElement from '@/components/CanvasElement.vue' 
import ContextMenuCanvas from '@/components/ContextMenuCanvas.vue'
import { useCanvasStore } from '@/stores/canvasStore'





const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const lastMenuScreenCoords = ref({ x: 0, y: 0 }) // saugom paskutinę menu poziciją

const viewportRef = ref(null)

const canvasStore = useCanvasStore()
import { storeToRefs } from 'pinia';
const { elements, pan, zoom } = storeToRefs(canvasStore);

// Elemento stilius su centru apskaičiuojamas tik kai DOM yra
function getElementStyle(element) {
  if (!sceneRef.value) return { left: '0px', top: '0px' };
  const sceneWidth = sceneRef.value.offsetWidth;
  const sceneHeight = sceneRef.value.offsetHeight;
  const centerX = sceneWidth / 2;
  const centerY = sceneHeight / 2;
  const left = (element.x + centerX);
  const top = (element.y + centerY);
  return {
    left: left + 'px',
    top: top + 'px'
  };
}

const sceneRef = ref(null);
let panzoomInstance = null;

// elements, panX, panY, scale dabar valdomi per Pinia store

const activeElementId = ref(null)

onMounted(() => {
  // Tikriname, ar sceneRef yra priskirtas
  if (sceneRef.value) {
    panzoomInstance = Panzoom(sceneRef.value, {
      canvas: true,
      maxScale: 3,
      minScale: 0.5,
      step: 0.1,
      excludeClass: 'draggable-element'
    });
    sceneRef.value.parentElement.addEventListener('wheel', panzoomInstance.zoomWithWheel);
  } else {
  }

  // Pan į drobės centrą po DOM atnaujinimo
  nextTick(() => {
    // Su transform-origin: center center, pan pozicija turi būti (0, 0)
  panzoomInstance.pan(0, 0);
  });

  // Panzoom įvykio metu atnaujiname pan ir zoom tik per actionus
  sceneRef.value.addEventListener('panzoomchange', () => {
    const panObj = panzoomInstance.getPan();
    const scaleVal = panzoomInstance.getScale();
    canvasStore.setPan(panObj.x, panObj.y);
    canvasStore.setZoom(scaleVal);
  });

  // TEST: Pridėti testinį elementą į Pinia store, kad patikrintume renderinimą
  canvasStore.addElement({
    id: 'test-debug',
    x: 0,
    y: 0,
    width: 120,
    height: 80,
    content: 'TEST ELEMENTAS',
    isActive: false
  });
});

onUnmounted(() => {
  if (panzoomInstance) {
    panzoomInstance.destroy()
  }
})


// Context menu event handler for the canvas
function onCanvasContextMenu(e) {
  contextMenuX.value = e.clientX
  contextMenuY.value = e.clientY
  lastMenuScreenCoords.value = { x: e.clientX, y: e.clientY } // išsaugom kur buvo iškviestas menu
  contextMenuVisible.value = true
}

// Helper: konvertuoja ekrano koordinatę į loginę drobės koordinatę
function screenToCanvasCoords(clientX, clientY) {
  const viewportRect = viewportRef.value.getBoundingClientRect();
  const canvasX = clientX - viewportRect.left;
  const canvasY = clientY - viewportRect.top;
  const pan = canvasStore.safePan;
  // Užtikrinam, kad zoom visada būtų skaičius ir ne 0
  const zoom = typeof canvasStore.zoom.value === 'number' && canvasStore.zoom.value !== 0 ? canvasStore.zoom.value : 1;
  const sceneWidth = sceneRef.value.offsetWidth;
  const sceneHeight = sceneRef.value.offsetHeight;
  const centerX = sceneWidth / 2;
  const centerY = sceneHeight / 2;
  return {
    x: ((canvasX - pan.x) / zoom) - centerX,
    y: ((canvasY - pan.y) / zoom) - centerY
  };
}

// Event handler: iškviečiamas kai ContextMenuCanvas emituoja 'add-element'
function handleAddElement() {
  const { x, y } = lastMenuScreenCoords.value;
  const pan = canvasStore.safePan;
  const zoom = typeof canvasStore.zoom.value === 'number' && canvasStore.zoom.value !== 0 ? canvasStore.zoom.value : 1;
  const sceneWidth = sceneRef.value.offsetWidth;
  const sceneHeight = sceneRef.value.offsetHeight;
  const centerX = sceneWidth / 2;
  const centerY = sceneHeight / 2;
  let { x: logicalX, y: logicalY } = screenToCanvasCoords(x, y);
  // Ribojam, kad elementas būtų matomas drobėje
  const maxX = sceneWidth / 2 - 60; // 60 = width/2
  const maxY = sceneHeight / 2 - 40; // 40 = height/2
  logicalX = Math.max(-maxX, Math.min(logicalX, maxX));
  logicalY = Math.max(-maxY, Math.min(logicalY, maxY));
  console.log('[DEBUG] Sukurtas naujas elementas:', { x: logicalX, y: logicalY, width: 120, height: 80 });
  canvasStore.addElement({
    id: Date.now().toString(),
    x: logicalX,
    y: logicalY,
    width: 120,
    height: 80,
    content: 'Naujas elementas',
    isActive: false
  });
  contextMenuVisible.value = false;
}

function handleElementUpdate({ id, x, y, width, height }) {
  const el = elements.value.find(e => e.id === id)
  if (el) {
    el.x = typeof x === 'number' ? x : 0;
    el.y = typeof y === 'number' ? y : 0;
    el.width = typeof width === 'number' && width > 20 ? width : 120;
    el.height = typeof height === 'number' && height > 20 ? height : 80;
  }
}

function onCanvasClick(e) {
  const target = e.target.closest('.canvas-element')
  if (target) {
    const id = target.getAttribute('data-id')
    activeElementId.value = id
  } else {
    activeElementId.value = null
  }
}

// ...elementų kūrimas dabar tik per Pinia action...

// ...getLogicalCoords nebereikalinga, naudojam screenToCanvasCoords...

function handlePanToMenuPosition() {
  const { x, y } = lastMenuScreenCoords.value;
  const { x: logicalX, y: logicalY } = screenToCanvasCoords(x, y);
  panzoomInstance.pan(-logicalX, -logicalY);
  contextMenuVisible.value = false;
}

// Pridėti elementą
// ...jei reikia pridėti elementą ar atnaujinti poziciją, naudokite tik per actions, pvz.:
// canvasStore.addElement({ id: '1', x: 100, y: 100, width: 120, height: 80, content: 'Elementas 1', isActive: false })
// canvasStore.updateElementPosition('1', 200, 300)

// Gauti būseną
// elements, pan, zoom now come from storeToRefs for true reactivity

</script>

<style>

.canvas-element.active {
  border: 2px solid #1976d2;
  box-shadow: 0 0 8px #1976d2;
}

.canvas-viewport {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: #222;
}

.canvas-scene {
  width: 1000px;
  height: 1000px;
  will-change: transform;
  background: #505050ff;
  transform-origin: center center;
}

.canvas-viewport,
.canvas-scene {
  padding: 0 !important;
  border: none !important;
  margin: 0 !important;
  box-shadow: none !important;
  overflow: hidden !important;
}

.canvas-element {
  position: absolute;
  background: #ff0 !important;
  border: 2px solid #f00 !important;
  z-index: 200;
  min-width: 40px;
  min-height: 40px;
  box-sizing: border-box;
}

</style>