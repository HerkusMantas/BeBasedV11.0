<template>
  <ContextMenu ref="menu" :model="items" />
</template>

<script setup>
import { ref, defineExpose } from 'vue'
import ContextMenu from 'primevue/contextmenu'

const menu = ref(null)
const items = [
  { label: 'Veiksmas 1', icon: 'pi pi-fw pi-pencil', command: () => {/* ... */} },
  { label: 'Veiksmas 2', icon: 'pi pi-fw pi-trash', command: () => {/* ... */} }
]

// Kad tėvinis komponentas galėtų iškviesti show(event)
defineExpose({
  show: (event) => menu.value.show(event)
})
</script>