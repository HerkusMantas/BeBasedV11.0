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

const position = ref({ x: 100, y: 40 });
const dragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });

const tools = [
  { name: 'Add Text', icon: '🅰️' },
  { name: 'Add Image', icon: '🖼️' },
  { name: 'Add Shape', icon: '⬛' }, // Galima pridėti figūrą (kvadratą, ratą ir pan.)
];

function startHandleDrag(e) {
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
  position.value.x = clientX - dragOffset.value.x;
  position.value.y = clientY - dragOffset.value.y;
}

function stopDrag() {
  dragging.value = false;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('touchmove', onDrag);
  window.removeEventListener('touchend', stopDrag);
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
