<template>
  <div class="toolbar">
    <button @click="$emit('addRect')" :disabled="!isReady" title="Add Rectangle">R</button>
    <!-- Undo/Redo laikinai pašalinti -->
    <span class="save-status">Status: {{ saveStatus }}</span>
  </div>
</template>

<script setup>
defineProps({
  saveStatus: String,
  isReady: Boolean,
});

defineEmits(['addRect']);
</script>

<style scoped>
/* Stiliai lieka tokie patys kaip anksčiau */
.toolbar { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 10; display: flex; gap: 8px; align-items: center; padding: 8px 12px; background: rgba(45, 45, 45, 0.9); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 1px solid rgba(255, 255, 255, 0.1); }
.toolbar button { background: transparent; border: 1px solid rgba(255, 255, 255, 0.2); color: white; width: 36px; height: 36px; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; }
.toolbar button:hover:not(:disabled) { background-color: rgba(255, 255, 255, 0.1); }
.toolbar button:disabled { opacity: 0.4; cursor: not-allowed; }
.save-status { margin-left: 12px; font-style: italic; color: #ccc; font-size: 12px; border-left: 1px solid #555; padding-left: 12px; }
</style>
