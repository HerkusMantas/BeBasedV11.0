<template>
  <Dialog 
        :visible="visible"
        header="Pasirinkite ikoną"
        :modal="true"
        :closable="true"
        @update:visible="emit('update:visible', $event)"
    >
    <div class="icon-grid">
      <span v-for="icon in icons" :key="icon" class="icon-option" @click="selectIcon(icon)">
        <i :class="icon"></i>
      </span>
    </div>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import Dialog from 'primevue/dialog'

const props = defineProps({
  visible: Boolean,
  icons: Array
})
const emit = defineEmits(['update:visible', 'select'])

function selectIcon(icon) {
  emit('select', icon)
  emit('update:visible', false)
}
</script>

<style>
.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.icon-option {
  font-size: 2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}
.icon-option:hover {
  background: #eee;
}
</style>