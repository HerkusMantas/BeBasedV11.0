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
          <p>Čia yra antro tabo turinys.</p>
          <div class="icon-list">
            <Icon v-for="name in iconList" :key="name" :icon="name" />
          </div>
        </TabPanel>
      </TabView>
    </div>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import { Icon } from '@iconify/vue';

const iconList = [
  'mdi:home',
  'uil:github',
  'mdi:folder',
  // ...kitos ikonos
];

const props = defineProps({
  visible: Boolean,
  icons: Array
})
const emit = defineEmits(['update:visible', 'select'])


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