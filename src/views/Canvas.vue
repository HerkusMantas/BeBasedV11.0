
<template>
  <div id="app" class="bg-gray-100 p-8 flex flex-col items-center min-h-screen">
    <div class="container mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 text-center mb-6">Mano HTML Drobė</h1>
      <div class="button-container">
        <button
          @click="addTextElement"
          class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors duration-300">
          Pridėti tekstą
        </button>
      </div>
      <div id="canvas-container"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseUp"
        :style="{ position: 'relative', left: panOffset.x + 'px', top: panOffset.y + 'px' }">
        <FloatingToolbar @add-text="addTextElement" />
        <div
          v-for="textElement in textElements"
          :key="textElement.id"
          class="text-element"
          :data-id="textElement.id"
          :style="{ top: textElement.y + 'px', left: textElement.x + 'px' }"
          @dblclick="startEditing(textElement, $event)"
          @blur="stopEditing(textElement)"
          @keydown.enter.prevent="stopEditing(textElement)"
          :contenteditable="textElement.isEditing"
          v-html="textElement.content">
        </div>
      </div>
      </div>
        <div class="canvas-frame">
          <div id="canvas-container"
            @mousedown="handleMouseDown"
            @mouseup="handleMouseUp"
            @mousemove="handleMouseMove"
            @mouseleave="handleMouseUp"
            :style="{ position: 'relative', left: panOffset.x + 'px', top: panOffset.y + 'px' }">
            <FloatingToolbar @add-text="addTextElement" />
            <div
              v-for="textElement in textElements"
              :key="textElement.id"
              class="text-element"
              :data-id="textElement.id"
              :style="{ top: textElement.y + 'px', left: textElement.x + 'px' }"
              @dblclick="startEditing(textElement, $event)"
              @blur="stopEditing(textElement)"
              @keydown.enter.prevent="stopEditing(textElement)"
              :contenteditable="textElement.isEditing"
              v-html="textElement.content">
            </div>
          </div>
        </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import FloatingToolbar from '../components/FloatingToolbar.vue';

export default {
  name: 'App',
  components: { FloatingToolbar },
  setup() {
    const textElements = ref([]);
  const isDragging = ref(false);
  const isPanning = ref(false);
  const panStart = ref({ x: 0, y: 0 });
  const panOffset = ref({ x: 0, y: 0 });
    const activeElement = ref(null);
    const initialX = ref(0);
    const initialY = ref(0);
    const xOffset = ref(0);
    const yOffset = ref(0);
    const isEditing = ref(false);

    function addTextElement() {
      const canvas = document.getElementById('canvas-container');
      const newText = {
        id: Date.now(),
        content: 'Vilkti mane!',
        x: Math.random() * (canvas.offsetWidth - 150),
        y: Math.random() * (canvas.offsetHeight - 50),
        isEditing: false
      };
      textElements.value.push(newText);
    }

    function startEditing(element, event) {
      element.isEditing = true;
      isEditing.value = true;
      activeElement.value = element;
      // Focus on the element after it becomes editable
      requestAnimationFrame(() => {
        event.target.focus();
        const range = document.createRange();
        range.selectNodeContents(event.target);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      });
    }

    function stopEditing(element) {
      // Update the content before stopping edit
      const editableElement = document.querySelector(`[data-id='${element.id}']`);
      if (editableElement) {
        element.content = editableElement.innerHTML;
      }
      element.isEditing = false;
      isEditing.value = false;
      activeElement.value = null;
    }

    function execCommand(command) {
      if (activeElement.value && isEditing.value) {
        document.execCommand(command, false, null);
      }
    }

    function handleMouseDown(e) {
      if (e.button === 1) { // Middle mouse button
        isPanning.value = true;
        panStart.value = { x: e.clientX - panOffset.value.x, y: e.clientY - panOffset.value.y };
        document.body.style.cursor = 'grab';
        e.preventDefault();
        return;
      }
      dragStart(e);
    }

    function handleMouseUp(e) {
      if (isPanning.value) {
        isPanning.value = false;
        document.body.style.cursor = '';
        return;
      }
      dragEnd(e);
    }

    function handleMouseMove(e) {
      if (isPanning.value) {
        panOffset.value.x = e.clientX - panStart.value.x;
        panOffset.value.y = e.clientY - panStart.value.y;
        e.preventDefault();
        return;
      }
      drag(e);
    }

    function dragEnd() {
      isDragging.value = false;
    }

    function drag(e) {
      if (!isDragging.value || !activeElement.value) return;
      e.preventDefault();

      let newX, newY;
      if (e.type === "touchmove") {
        newX = e.touches[0].clientX - xOffset.value;
        newY = e.touches[0].clientY - yOffset.value;
      } else {
        newX = e.clientX - xOffset.value;
        newY = e.clientY - yOffset.value;
      }

      const canvas = document.getElementById('canvas-container');
      const targetElement = e.target.closest('.text-element');
      const maxX = canvas.offsetWidth - targetElement.offsetWidth;
      const maxY = canvas.offsetHeight - targetElement.offsetHeight;

      activeElement.value.x = Math.min(Math.max(0, newX), maxX);
      activeElement.value.y = Math.min(Math.max(0, newY), maxY);
    }

    // dragStart, dragEnd, drag turi būti apibrėžtos, nes naudojamos handleMouseDown ir pan.
    function dragStart(e) {
      if (isEditing.value) return;

      const targetElement = e.target.closest('.text-element');
      if (targetElement) {
        isDragging.value = true;
        const elementId = parseInt(targetElement.getAttribute('data-id'));
        activeElement.value = textElements.value.find(el => el.id === elementId);

        if (e.type === "touchstart") {
          initialX.value = e.touches[0].clientX - targetElement.offsetLeft;
          initialY.value = e.touches[0].clientY - targetElement.offsetTop;
        } else {
          initialX.value = e.clientX - targetElement.offsetLeft;
          initialY.value = e.clientY - targetElement.offsetTop;
        }

        xOffset.value = initialX.value;
        yOffset.value = initialY.value;
      }
    }

    function dragEnd() {
      isDragging.value = false;
    }

    function drag(e) {
      if (!isDragging.value || !activeElement.value) return;
      e.preventDefault();

      let newX, newY;
      if (e.type === "touchmove") {
        newX = e.touches[0].clientX - xOffset.value;
        newY = e.touches[0].clientY - yOffset.value;
      } else {
        newX = e.clientX - xOffset.value;
        newY = e.clientY - yOffset.value;
      }

      const canvas = document.getElementById('canvas-container');
      const targetElement = e.target.closest('.text-element');
      const maxX = canvas.offsetWidth - targetElement.offsetWidth;
      const maxY = canvas.offsetHeight - targetElement.offsetHeight;

      activeElement.value.x = Math.min(Math.max(0, newX), maxX);
      activeElement.value.y = Math.min(Math.max(0, newY), maxY);
    }

    return {
      textElements,
      addTextElement,
      startEditing,
      stopEditing,
      execCommand,
      handleMouseDown,
      handleMouseUp,
      handleMouseMove,
      isEditing,
      panOffset
    };
  }
};
</script>

<style scoped>
#canvas-container {
  position: relative;
  width: 100%;
  height: 500px;
  border: 2px solid #3f3f3fff;
  background-color: #1f1f1f;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 1.5rem;
}
.canvas-frame {
  width: 100vw;
  height: calc(100vh - 180px); /* 180px apytiksliai: header + button + toolbar, jei reikia – pakoreguokite */
  max-width: 100vw;
  max-height: calc(100vh - 180px);
  overflow: hidden;
  border: 2px solid #3f3f3fff;
  background: #181818;
  border-radius: 8px;
  margin: 0 auto;
  position: relative;
}
#canvas-container {
  position: relative;
  width: 2000px; /* virtualios drobės plotis */
  height: 1200px; /* virtualios drobės aukštis */
  background-color: #1f1f1f;
  border-radius: 8px;
  overflow: visible;
}
.text-element {
  position: absolute;
  cursor: grab;
  color: #181818ff;
  background-color: #f0f0f0;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  user-select: none;
  touch-action: none;
  font-size: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: transform 0.1s ease-out;
  outline: none;
}
.text-element:active {
  cursor: grabbing;
}
.text-element[contenteditable="true"] {
  cursor: text;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}
.button-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  margin-bottom: 1.5rem;
}
</style>
