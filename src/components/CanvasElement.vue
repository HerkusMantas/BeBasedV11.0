<template>
  <DraggableResizableVue
    :w="width"
    :h="height"
    :x="x"
    :y="y"
    :active="isActive"
    @dragging="onDrag"
    @resizing="onResize"
    @dragstop="onDragStop"
    @resizestop="onResizeStop"
    :parent="true"
    class-name="draggable-element"
    :handles="['tl', 'tr', 'bl', 'br']"
    @mousedown.stop
    style="min-width:40px; min-height:40px; z-index:201; box-sizing:border-box; background:#ff0; border:2px solid #f00;"
  >
    <slot></slot>
  </DraggableResizableVue>
</template>

<script setup>
import { DraggableResizableVue } from 'draggable-resizable-vue3'
import { defineProps, defineEmits } from 'vue'

const rawProps = defineProps({
  id: String,
  x: Number,
  y: Number,
  width: Number,
  height: Number,
  isActive: Boolean,
  content: String
})

// Validuojam x ir y props
const props = {
  ...rawProps,
  x: typeof rawProps.x === 'number' ? rawProps.x : 0,
  y: typeof rawProps.y === 'number' ? rawProps.y : 0
}

const emit = defineEmits(['update'])

function onDragStop({ x, y }) {
  // x/y yra DOM top-left koordinatės, reikia konvertuoti į loginę (nuo centro)
  const parent = document.querySelector('.canvas-scene');
  const sceneWidth = parent.offsetWidth;
  const sceneHeight = parent.offsetHeight;
  const centerX = sceneWidth / 2;
  const centerY = sceneHeight / 2;
  // Konvertuojam atgal į loginę sistemą
  const logicalX = x - centerX;
  const logicalY = y - centerY;
  emit('update', { id: props.id, x: logicalX, y: logicalY, width: props.width, height: props.height });
}
function onResizeStop({ x, y, w, h }) {
  const parent = document.querySelector('.canvas-scene');
  const sceneWidth = parent.offsetWidth;
  const sceneHeight = parent.offsetHeight;
  const centerX = sceneWidth / 2;
  const centerY = sceneHeight / 2;
  // Konvertuojam atgal į loginę sistemą
  const logicalX = x - centerX;
  const logicalY = y - centerY;
  console.log('[DEBUG] Resize stop:', { x: logicalX, y: logicalY, width: w, height: h });
  emit('update', { id: props.id, x: logicalX, y: logicalY, width: w, height: h });
}

// Dragging/resizing eventai gali būti naudojami UI efektams, bet tėvinio būsenos neatnaujina
function onDrag() {}
function onResize() {}
</script>