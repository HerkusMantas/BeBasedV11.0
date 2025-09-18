
<template>
  <div id="app" class="bg-gray-100 p-8 flex flex-col items-center min-h-screen">
    <div class="container mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 text-center mb-6">Mano HTML Drobė</h1>
      <!-- Mygtukas perkeltas į FloatingToolbar.vue -->
      <div class="canvas-frame" style="position:relative;">
        <!-- Koordinačių overlay viršuje dešinėje -->
        
        <FloatingToolbar @add-text="addTextElement" />
        <div id="canvas-container"
          @mousedown="handleMouseDown"
          @mouseup="handleMouseUp"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseUp"
          style="position:relative;">
          <div
            v-for="textElement in visibleElements"
            :key="textElement.id"
            class="text-element"
            :data-id="textElement.id"
            :style="{
              top: (-(textElement.y - panOffset.y)) + 'px',
              left: (-(textElement.x - panOffset.x)) + 'px',
              backgroundColor: textElement.backgroundColor || '#f0f0f0',
              fontSize: textElement.fontSize ? textElement.fontSize + 'px' : undefined,
              whiteSpace: textElement.wrap ? 'pre-wrap' : undefined
            }"
            @dblclick="startEditing(textElement, $event)"
            @blur="(e) => {
              // Jei blur įvyko dėl paspaudimo ant toolbar, nieko nedaryti
              if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.text-edit-toolbar')) return;
              stopEditing(textElement);
            }"
            @keydown.enter.prevent="stopEditing(textElement)"
            :contenteditable="textElement.isEditing"
            tabindex="0"
          >
            <div v-html="textElement.content"></div>
          </div>
          <TextEditToolbar
            v-if="showToolbar"
            :visible="showToolbar"
            :x="toolbarPos.x"
            :y="toolbarPos.y"
            @font-size="handleFontSize"
            @wrap="handleWrap"
            @bullets="handleBullets"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import FloatingToolbar from '../components/FloatingToolbar.vue';
import TextEditToolbar from '../components/TextEditToolbar.vue';

export default {
  name: 'App',
  components: { FloatingToolbar, TextEditToolbar },
  setup() {
    // Toolbar state
    const showToolbar = ref(false);
    const toolbarPos = ref({ x: 0, y: 0 });
  const isSpacePressed = ref(false);
  const textElements = ref([]);
  const frameSize = ref({ width: 0, height: 0 });
  const isDragging = ref(false);
  const isPanning = ref(false);
  const panStart = ref({ x: 0, y: 0 });
  const panOffset = ref({ x: 0, y: 0 });

  // Centruoti drobės (canvas) tašką (5000, 5000) rėmo centre paleidžiant
  
  onMounted(() => {
    // Space panning eventai
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        isSpacePressed.value = true;
        // Neleisti scrollinti puslapio
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        isSpacePressed.value = false;
      }
    });
    const frame = document.querySelector('.canvas-frame');
    if (frame) {
      frameSize.value.width = frame.offsetWidth;
      frameSize.value.height = frame.offsetHeight;
      // Norime, kad (5000, 5000) drobės taškas būtų rėmo centre
      panOffset.value.x = (frame.offsetWidth / 2) - 5000;
      panOffset.value.y = (frame.offsetHeight / 2) - 5000;
    }
    window.addEventListener('resize', () => {
      if (frame) {
        frameSize.value.width = frame.offsetWidth;
        frameSize.value.height = frame.offsetHeight;
      }
    });
  });
    // Tik matomi elementai (virtualus canvas principas)
    const visibleElements = computed(() => {
      const pad = 200; // renderinti šiek tiek daugiau nei matoma
      return textElements.value.filter(el => {
        const screenX = -(el.x - panOffset.value.x);
        const screenY = -(el.y - panOffset.value.y);
        return (
          screenX >= -pad &&
          screenX <= frameSize.value.width + pad &&
          screenY >= -pad &&
          screenY <= frameSize.value.height + pad
        );
      });
    });
    const activeElement = ref(null);
    const initialX = ref(0);
    const initialY = ref(0);
    const xOffset = ref(0);
    const yOffset = ref(0);
    const isEditing = ref(false);

    function getRandomPastelColor() {
      const hue = Math.floor(Math.random() * 360);
      return `hsl(${hue}, 70%, 85%)`;
    }

    function addTextElement() {
      // Pridedam į ekrano (frame) centrą, nepriklausomai nuo panOffset
      const width = 200;
      const height = 200;
      const frame = document.querySelector('.canvas-frame');
      let frameW = 0, frameH = 0;
      if (frame) {
        frameW = frame.offsetWidth;
        frameH = frame.offsetHeight;
      } else {
        frameW = window.innerWidth;
        frameH = window.innerHeight;
      }
      // screenX = frameW/2 - width/2, screenY = frameH/2 - height/2
      // x = panOffset.x - screenX
      // y = panOffset.y - screenY
      const screenX = frameW / 2 - width / 2;
      const screenY = frameH / 2 - height / 2;
      const x = panOffset.value.x - screenX;
      const y = panOffset.value.y - screenY;
      const newText = {
        id: Date.now(),
        content: 'Your text here',
        x,
        y,
        isEditing: false,
        backgroundColor: getRandomPastelColor()
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

        // Toolbar pozicija virš caret/cursor
        let caretRect;
        try {
          if (selection.rangeCount > 0) {
            const selRange = selection.getRangeAt(0);
            caretRect = selRange.getBoundingClientRect();
          }
        } catch (e) {}
        if (caretRect && caretRect.top !== 0 && caretRect.left !== 0) {
          toolbarPos.value = {
            x: caretRect.left + window.scrollX,
            y: caretRect.top + window.scrollY - 100 // 50px virš caret
          };
        } else {
          // fallback į elementą
          const rect = event.target.getBoundingClientRect();
          toolbarPos.value = {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY - 100
          };
        }
        showToolbar.value = true;
      });
      // Click outside to close edit
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside, true);
      }, 0);
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
      showToolbar.value = false;
      document.removeEventListener('mousedown', handleClickOutside, true);
    }

    function handleClickOutside(e) {
      // Jei paspausta ant toolbar arba ant redaguojamo elemento – nieko nedaryti
      const toolbar = document.querySelector('.text-edit-toolbar');
      const editing = activeElement.value && document.querySelector(`[data-id='${activeElement.value.id}']`);
      if ((toolbar && toolbar.contains(e.target)) || (editing && editing.contains(e.target))) {
        return;
      }
      if (activeElement.value) stopEditing(activeElement.value);
    }
    // Toolbar event handlers
    function handleFontSize(delta) {
      if (!activeElement.value) return;
      const el = document.querySelector(`[data-id='${activeElement.value.id}']`);
      if (!el) return;
      // Gauk dabartinį font-size
      let fs = parseFloat(window.getComputedStyle(el).fontSize) || 16;
      fs = Math.max(8, Math.min(96, fs + delta * 2));
      el.style.fontSize = fs + 'px';
      activeElement.value.fontSize = fs;
    }
    function handleWrap() {
      if (!activeElement.value) return;
      const el = document.querySelector(`[data-id='${activeElement.value.id}']`);
      if (!el) return;
      const isWrapped = el.style.whiteSpace === 'pre-wrap' || window.getComputedStyle(el).whiteSpace === 'pre-wrap';
      el.style.whiteSpace = isWrapped ? 'nowrap' : 'pre-wrap';
      activeElement.value.wrap = !isWrapped;
    }
    function handleBullets() {
      if (!activeElement.value) return;
      document.execCommand('insertUnorderedList');
    }

    function execCommand(command) {
      if (activeElement.value && isEditing.value) {
        document.execCommand(command, false, null);
      }
    }

    function handleMouseDown(e) {
      const frame = document.querySelector('.canvas-frame');
      const canvas = document.getElementById('canvas-container');
      if (!frame || !canvas) return;
      const frameW = frame.offsetWidth;
      const frameH = frame.offsetHeight;
      const canvasW = canvas.offsetWidth;
      const canvasH = canvas.offsetHeight;

      // Jei drobė mažesnė už rėmą – panning neveikia
      if (canvasW <= frameW && canvasH <= frameH) {
        // Centruojam drobę
        panOffset.value.x = (frameW - canvasW) / 2;
        panOffset.value.y = (frameH - canvasH) / 2;
        return;
      }

      // Panning su Space arba su viduriniu pelės mygtuku
      if (e.button === 1 || (e.button === 0 && isSpacePressed.value)) {
        isPanning.value = true;
        // INVERT: panStart saugo pelės poziciją ir dabartinį panOffset
        panStart.value = { x: e.clientX, y: e.clientY, ox: panOffset.value.x, oy: panOffset.value.y };
        document.body.style.cursor = 'grab';
        // Panning eventai ant window, kad nenutrūktų už rėmo
        window.addEventListener('mousemove', handleMouseMoveWindow);
        window.addEventListener('mouseup', handleMouseUpWindow);
        e.preventDefault();
        return;
      }
      dragStart(e);
      // Drag eventai ant window, kad drag nesibaigtų išėjus už rėmo
      window.addEventListener('mousemove', handleMouseMoveWindowDrag);
      window.addEventListener('mouseup', handleMouseUpWindowDrag);
    }
    // Drag eventai ant window (kad drag veiktų už rėmo ribų)
    function handleMouseMoveWindowDrag(e) {
      handleMouseMove(e);
    }
    function handleMouseUpWindowDrag(e) {
      dragEnd(e);
      window.removeEventListener('mousemove', handleMouseMoveWindowDrag);
      window.removeEventListener('mouseup', handleMouseUpWindowDrag);
    }

    function handleMouseMoveWindow(e) {
      handleMouseMove(e);
    }

    function handleMouseUpWindow(e) {
      isPanning.value = false;
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMoveWindow);
      window.removeEventListener('mouseup', handleMouseUpWindow);
    }

    function handleMouseUp(e) {
      if (isPanning.value) {
        // Panning nutraukiamas per window eventą
        return;
      }
      dragEnd(e);
    }

    function handleMouseMove(e) {
      if (isPanning.value) {
        const frame = document.querySelector('.canvas-frame');
        const canvas = document.getElementById('canvas-container');
        if (!frame || !canvas) return;
        const frameW = frame.offsetWidth;
        const frameH = frame.offsetHeight;
        const canvasW = canvas.offsetWidth;
        const canvasH = canvas.offsetHeight;

        // Jei drobė mažesnė už rėmą – centruojam ir panning neleidžiam
        if (canvasW <= frameW && canvasH <= frameH) {
          panOffset.value.x = (frameW - canvasW) / 2;
          panOffset.value.y = (frameH - canvasH) / 2;
          return;
        }

        // INVERT: panning kryptis atvirkščia
        let newX = panStart.value.ox - (e.clientX - panStart.value.x);
        let newY = panStart.value.oy - (e.clientY - panStart.value.y);

        if (canvasW <= frameW) {
          newX = (frameW - canvasW) / 2;
        } else {
          const minX = frameW - canvasW;
          const maxX = 0;
          newX = Math.max(minX, Math.min(maxX, newX));
        }

        if (canvasH <= frameH) {
          newY = (frameH - canvasH) / 2;
        } else {
          const minY = frameH - canvasH;
          const maxY = 0;
          newY = Math.max(minY, Math.min(maxY, newY));
        }

        panOffset.value.x = newX;
        panOffset.value.y = newY;
        e.preventDefault();
        return;
      }
      drag(e);
    }


    // Edge-panning kintamieji
    let edgePanInterval = null;
    let lastPan = { x: 0, y: 0 };

    function drag(e) {
        if (!isDragging.value || !activeElement.value) return;
        e.preventDefault();
        const frame = document.querySelector('.canvas-frame');
        const elem = document.querySelector(`.text-element[data-id='${activeElement.value.id}']`);
        if (!frame || !elem) return;

        // Drag offset atnaujinimas jei panningo metu pasikeitė panOffset
        if (lastPan.x !== panOffset.value.x || lastPan.y !== panOffset.value.y) {
            xOffset.value += panOffset.value.x - lastPan.x;
            yOffset.value += panOffset.value.y - lastPan.y;
            lastPan.x = panOffset.value.x;
            lastPan.y = panOffset.value.y;
        }

        // INVERT: drag veikia atvirkščiai, bet offsetas – pelės pozicija MINUS elemento ekrano pozicija
        let mouseX, mouseY;
        if (e.type === "touchmove") {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
        } else {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
        // screenX = mouseX - xOffset.value
        // x = panOffset.x - screenX
        const screenX = mouseX - xOffset.value;
        const screenY = mouseY - yOffset.value;
        let newX = panOffset.value.x - screenX;
        let newY = panOffset.value.y - screenY;

        // Bounding pagal invertuotą sistemą
        const elemWidth = elem.offsetWidth;
        const elemHeight = elem.offsetHeight;
        const minX = panOffset.value.x - frame.offsetWidth + elemWidth;
        const maxX = panOffset.value.x;
        const minY = panOffset.value.y - frame.offsetHeight + elemHeight;
        const maxY = panOffset.value.y;
        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));

        activeElement.value.x = newX;
        activeElement.value.y = newY;
}

    // Sustabdyti edge-panning kai baigiam drag

    function dragEnd() {
      isDragging.value = false;
      if (edgePanInterval) {
        clearInterval(edgePanInterval);
        edgePanInterval = null;
      }
      // Nuimti drag eventus nuo window (jei dar yra)
      window.removeEventListener('mousemove', handleMouseMoveWindowDrag);
      window.removeEventListener('mouseup', handleMouseUpWindowDrag);
    }

    // dragStart, dragEnd, drag turi būti apibrėžtos, nes naudojamos handleMouseDown ir pan.
    function dragStart(e) {
        if (isEditing.value) return;
        const targetElement = e.target.closest('.text-element');
        if (targetElement) {
            isDragging.value = true;
            const elementId = parseInt(targetElement.getAttribute('data-id'));
            activeElement.value = textElements.value.find(el => el.id === elementId);
            // INVERT: drag offset turi būti pelės pozicija MINUS elemento ekrano pozicija
            const el = activeElement.value;
            let mouseX, mouseY;
            if (e.type === "touchstart") {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
            } else {
            mouseX = e.clientX;
            mouseY = e.clientY;
            }
            // Elemento ekrano pozicija:
            const screenX = -(el.x - panOffset.value.x);
            const screenY = -(el.y - panOffset.value.y);
            xOffset.value = mouseX - screenX;
            yOffset.value = mouseY - screenY;
            lastPan.x = panOffset.value.x;
            lastPan.y = panOffset.value.y;
    }
}

    


    return {
      textElements,
      visibleElements,
      addTextElement,
      startEditing,
      stopEditing,
      execCommand,
      handleMouseDown,
      handleMouseUp,
      handleMouseMove,
      isEditing,
      panOffset,
      isSpacePressed,
      showToolbar,
      toolbarPos,
      handleFontSize,
      handleWrap,
      handleBullets
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
  width: 97vw;
  height: calc(100vh - 180px); /* 180px apytiksliai: header + button + toolbar, jei reikia – pakoreguokite */
  max-width: 97vw;
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
  width: 10000px; /* virtualios drobės plotis */
  height: 10000px; /* virtualios drobės aukštis */
  background-color: #23272e;
  background-image:
    repeating-linear-gradient(0deg, #2d313a 0px, #2d313a 1px, transparent 1px, transparent 40px),
    repeating-linear-gradient(90deg, #2d313a 0px, #2d313a 1px, transparent 1px, transparent 40px);
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
  min-width: 200px;
  min-height: 200px;
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
