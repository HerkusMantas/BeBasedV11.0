<template>
  <div v-if="visible" :style="{ position: 'absolute', left: x + 'px', top: y + 'px', zIndex: 1000 }" class="context-menu">
    <ul>
      <li @click="addElement">Add element</li>
      <li @click="panToMenu">Pan į šią vietą</li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps(['visible', 'x', 'y'])
const emit = defineEmits(['add-element', 'close'])


function addElement() {
  emit('add-element')
  emit('close')
}
function panToMenu() {
  emit('pan-to-menu')
  emit('close')
}
</script>

<style>
.context-menu {
  background: #222;
  color: #fff;
  border: 1px solid #444;
  border-radius: 4px;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.context-menu ul {
  list-style: none;
  margin: 0;
  padding: 8px 0;
}
.context-menu li {
  padding: 8px 16px;
  cursor: pointer;
}
.context-menu li:hover {
  background: #444;
}
</style>