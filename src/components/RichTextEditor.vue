<template>
  <div class="rich-text-wrapper" :style="wrapperStyle">
    <editor-content :editor="editor" />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { defineProps, defineEmits, watch, onUnmounted, computed } from 'vue';

const props = defineProps({
  content: Object,
  position: Object, // { x, y }
});

const emit = defineEmits(['update:content']);

const editor = useEditor({
  content: props.content,
  extensions: [
    StarterKit,
  ],
  editable: true,
  onUpdate: ({ editor }) => {
    const json = editor.getJSON();
    emit('update:content', json);
  },
});

watch(() => props.content, (newContent) => {
  if (editor.value && JSON.stringify(newContent) !== JSON.stringify(editor.value.getJSON())) {
    editor.value.commands.setContent(newContent, false);
  }
});

const wrapperStyle = computed(() => ({
  top: `${props.position?.y || 0}px`,
  left: `${props.position?.x || 0}px`,
}));

onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});
</script>

<style>
/* Globalūs stiliai TipTap redaktoriui */
.ProseMirror {
  padding: 10px;
  border: 1px solid #ccc;
  min-height: 50px;
}
.ProseMirror:focus {
  outline: none;
  border-color: #68B2A0;
}

.rich-text-wrapper {
  position: absolute;
  background-color: white;
  z-index: 10;
}
</style>