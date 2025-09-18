<template>
  <div v-if="visible" :style="toolbarStyle" class="text-edit-toolbar">
    <div class="toolbar-handle" @mousedown="startDrag" @touchstart="startDrag" title="Tempti">
      <svg width="16" height="24" viewBox="0 0 16 24"><circle v-for="i in 4" :key="i" :cy="4*i" cx="8" r="1.5" fill="#888"/></svg>
    </div>
    <button @click="changeFontSize(-1)">A-</button>
    <button @click="changeFontSize(1)">A+</button>
    <button @click="toggleWrap">Wrap</button>
    <button @click="makeBulletedList">• List</button>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  visible: Boolean,
  x: Number,
  y: Number,
  targetEl: Object // DOM element arba null
});
const emit = defineEmits(['font-size', 'wrap', 'bullets']);


const dragOffset = ref({ x: 0, y: 0 });
const dragPos = ref({ x: props.x || 0, y: props.y || 0 });
const isDragging = ref(false);

const toolbarStyle = computed(() => ({
  position: 'absolute',
  top: dragPos.value.y + 'px',
  left: dragPos.value.x + 'px',
  zIndex: 1000,
  cursor: isDragging.value ? 'grabbing' : 'default',
  userSelect: isDragging.value ? 'none' : 'auto'
}));

watch(() => [props.x, props.y], ([newX, newY]) => {
  if (!isDragging.value) {
    dragPos.value = { x: newX || 0, y: newY || 0 };
  }
});

function startDrag(e) {
  // Prevent blur on contenteditable when clicking handle
  e.preventDefault();
  isDragging.value = true;
  const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
  const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
  dragOffset.value = {
    x: clientX - dragPos.value.x,
    y: clientY - dragPos.value.y
  };
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('touchmove', onDrag, { passive: false });
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchend', stopDrag);
}

function onDrag(e) {
  if (!isDragging.value) return;
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
  dragPos.value = {
    x: clientX - dragOffset.value.x,
    y: clientY - dragOffset.value.y
  };
  if (e.type.startsWith('touch')) e.preventDefault();
}

function stopDrag() {
  isDragging.value = false;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('touchmove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('touchend', stopDrag);
}

function changeFontSize(delta) {
  emit('font-size', delta);
}
function toggleWrap() {
  emit('wrap');
}
function makeBulletedList() {
  emit('bullets');
}
// ...existing code...
</script>

<style scoped>
.text-edit-toolbar {
  display: flex;
  gap: 0.5rem;
  background: #363636ff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 0.25rem 0.5rem;
  align-items: center;
  min-width: 180px;
}
.toolbar-handle {
  width: 18px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  margin-right: 0.5rem;
  user-select: none;
  touch-action: none;
}
.toolbar-handle svg {
  display: block;
}
.text-edit-toolbar button {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.15s;
}
.text-edit-toolbar button:hover {
  background: #1f1f1f;
}
</style>
