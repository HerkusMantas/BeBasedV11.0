<template>
  <Dialog 
        :visible="visible"
        header="Pasirinkite ikoną"
        :modal="true"
        :closable="true"
        @update:visible="emit('update:visible', $event)"
    >
    <div class="icon-grid">
      <TabView>
        <TabPanel header="Pirmas Tabas">
          <p>Čia yra pirmo tabo turinys.</p>
        </TabPanel>
        <TabPanel header="Antras Tabas">
          <div class="color-palette">
      <span
        v-for="color in colorList"
        :key="color"
        :style="{ background: color }"
        class="color-option"
        @click="selectedColor = color"
        :class="{ selected: selectedColor === color }"
      ></span>
    </div>
    <div class="icon-grid">
      <Icon
        v-for="name in iconList"
        :key="name"
        :icon="name"
        :style="{ color: selectedColor }"
        class="icon-option"
        @click="selectIcon(name)"
      />
    </div>
        </TabPanel>
      </TabView>
    </div>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import { Icon } from '@iconify/vue'
import '../styles/iconpicker.css'

const iconList = [
  'mdi:home',
  'uil:github',
  'mdi:folder',
  // ...kitos ikonos
]
const colorList = ['#333', '#1976d2', '#e91e63', '#4caf50', '#ff9800', '#fff']

const selectedColor = ref('#333')

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible', 'select'])

function selectIcon(icon) {
  emit('select', { icon, color: selectedColor.value })
  emit('update:visible', false)
}
</script>

