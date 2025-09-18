<template>
  <div
    class="floating-toolbar"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @mousedown="startDrag"
    @touchstart.prevent="startDrag"
  >
    <div class="toolbar-handle" @mousedown.stop="startHandleDrag" @touchstart.stop.prevent="startHandleDrag">
      <span class="dots"></span>
    </div>
    <div class="toolbar-icons">
      <button
        v-for="tool in tools"
        :key="tool.name"
        class="toolbar-btn"
        :title="tool.name"
        @click="handleToolClick(tool.name)"
      >
        <span v-html="tool.icon"></span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

import { onMounted } from 'vue';
const position = ref({ x: 100, y: 40 });

onMounted(() => {
  // Centruojam X pagal frame plotį, Y paliekam kaip buvo (pvz. 40)
  const frame = document.querySelector('.canvas-frame');
  const toolbar = document.querySelector('.floating-toolbar');
  if (frame && toolbar) {
    const frameRect = frame.getBoundingClientRect();
    const toolbarRect = toolbar.getBoundingClientRect();
    position.value.x = (frameRect.width - toolbarRect.width) / 2;
    // position.value.y paliekam kaip buvo (pvz. 40)
  }
});
const dragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
let frameRect = null;
let edgePanInterval = null;

const tools = [
  { name: 'Add Text', icon: '🅰️' },
  { name: 'Add Image', icon: '🖼️' },
  { name: 'Add Shape', icon: '⬛' }, // Galima pridėti figūrą (kvadratą, ratą ir pan.)
];

function startHandleDrag(e) {
  // Gauti frame ribas
  const frame = document.querySelector('.canvas-frame');
  if (frame) frameRect = frame.getBoundingClientRect();
  dragging.value = true;
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
  dragOffset.value = {
    x: clientX - position.value.x,
    y: clientY - position.value.y,
  };
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchmove', onDrag, { passive: false });
  window.addEventListener('touchend', stopDrag);
}

function startDrag(e) {
  // Prevent accidental drag on toolbar body
}

function onDrag(e) {
  if (!dragging.value) return;
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
  const toolbar = document.querySelector('.floating-toolbar');
  if (frameRect && toolbar) {
    const toolbarRect = toolbar.getBoundingClientRect();
    const minX = 0;
    const minY = 0;
    const maxX = frameRect.width - toolbarRect.width;
    const maxY = frameRect.height - toolbarRect.height;
    const edgeZone = 24;
    let panX = 0, panY = 0;
    if (clientX - frameRect.left < edgeZone) panX = -6;
    else if (frameRect.right - clientX < edgeZone) panX = 6;
    if (clientY - frameRect.top < edgeZone) panY = -6;
    else if (frameRect.bottom - clientY < edgeZone) panY = 6;
    if ((panX !== 0 || panY !== 0) && !edgePanInterval) {
      edgePanInterval = setInterval(() => {
        position.value.x = Math.max(minX, Math.min(maxX, position.value.x + panX));
        position.value.y = Math.max(minY, Math.min(maxY, position.value.y + panY));
      }, 16);
    } else if (panX === 0 && panY === 0 && edgePanInterval) {
      clearInterval(edgePanInterval);
      edgePanInterval = null;
    }
    // Jei pelė išeina už frame ribų, prikabinam toolbar prie krašto
    let newX = clientX - dragOffset.value.x;
    let newY = clientY - dragOffset.value.y;
    if (clientX < frameRect.left) newX = minX;
    else if (clientX > frameRect.right) newX = maxX;
    else newX = Math.max(minX, Math.min(maxX, newX));
    if (clientY < frameRect.top) newY = minY;
    else if (clientY > frameRect.bottom) newY = maxY;
    else newY = Math.max(minY, Math.min(maxY, newY));
    position.value.x = newX;
    position.value.y = newY;
  }
}

function stopDrag() {
  dragging.value = false;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('touchmove', onDrag);
  window.removeEventListener('touchend', stopDrag);
  if (edgePanInterval) {
    clearInterval(edgePanInterval);
    edgePanInterval = null;
  }
}
function handleToolClick(name) {
  if (name === 'Add Text') {
    // Emitinam eventą į tėvinį komponentą
    emit('add-text');
  }
  // Kitiems mygtukams galima pridėti analogiškai
}

const emit = defineEmits(['add-text']);
</script>

<style scoped>
.floating-toolbar {
  position: absolute;
  display: flex;
  align-items: center;
  background: #222e3a;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  padding: 0.25rem 0.5rem;
  z-index: 100;
  user-select: none;
  min-width: 220px;
}
.toolbar-handle {
  cursor: grab;
  padding: 0.5rem 0.3rem 0.5rem 0.1rem;
  display: flex;
  align-items: center;
  margin-right: 0.7rem;
}
.toolbar-handle:active {
  cursor: grabbing;
}
.dots {
  display: block;
  width: 16px;
  height: 20px;
  background: repeating-radial-gradient(circle, #b0b6c3 1.5px, transparent 2.5px);
  background-size: 5px 5px;
  border-radius: 4px;
}
.toolbar-icons {
  display: flex;
  gap: 0.5rem;
}
.toolbar-btn {
  background: none;
  border: none;
  color: #e0e6f0;
  font-size: 1.3rem;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  transition: background 0.15s;
  cursor: pointer;
}
.toolbar-btn:hover {
  background: #2d3a4d;
}
</style>
