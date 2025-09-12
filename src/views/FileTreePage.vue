<template>
  <div>
    <div style="display: flex; align-items: center;">
      <Icon icon="fluent:brain-circuit-28-regular" style="font-size: 2.5rem; color: #ed6464;" />
      <h1>_Be Based Data Base</h1>
    </div>
    <FileTree />
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import FileTree from '@/components/FileTree.vue';
</script>