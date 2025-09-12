<template>
  <ContextMenu ref="menu" :model="items" />
</template>

<script setup>

import { ref, defineExpose, defineEmits } from 'vue'
import ContextMenu from 'primevue/contextmenu'

const lastNode = ref(null)
const emit = defineEmits(['openIconPicker'])
const menu = ref(null)
const items = [
  { label: 'Veiksmas 1', icon: 'pi pi-fw pi-pencil', command: () => {/* ... */} },
  { label: 'Keisti ikoną', icon: 'pi pi-fw pi-image', command: () => {
      console.log('DEBUG: lastNode.value:', lastNode.value)
      if (lastNode.value) {
        emit('openIconPicker', lastNode.value)
      } else {
        console.warn('DEBUG: lastNode.value undefined')
      }
    } }
  ]

// Kad tėvinis komponentas galėtų iškviesti show(event)
defineExpose({
  show: (event, node) => {
    lastNode.value = node
    menu.value.show(event)
  }
})
</script>
