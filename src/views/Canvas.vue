<template>
  <div class="canvas-container" ref="containerRef">
    <Toolbar
      :save-status="saveStatus"
      :is-ready="!!stageRef"
      @add-rect="addRect"
    />
    
    <v-stage v-if="stageConfig.width" ref="stageRef" :config="stageConfig" @wheel="handleWheel">
      <v-layer>
        <component
          v-for="shape in shapes"
          :key="shape.id"
          :is="shape.component"
          :config="shape.config"
          @dragend="handleDragEnd"
        ></component>
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { onShapesSnapshot, addShape, updateShape } from '../firebase';
import Toolbar from '../components/CanvasToolbar.vue';

const route = useRoute();
const canvasId = ref(route.params.id);

const containerRef = ref(null);
const stageRef = ref(null);
const shapes = reactive([]);
const stageConfig = ref({ width: null, height: null, draggable: true, scaleX: 1, scaleY: 1, x: 0, y: 0 });
const saveStatus = ref('loading');

let unsubscribe = null; // Kintamasis atsisakyti prenumeratos

// ----- Duomenų valdymas (Realaus laiko) -----
onMounted(() => {
  saveStatus.value = 'loading';
  
  unsubscribe = onShapesSnapshot(canvasId.value, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const docData = change.doc.data();
      const docId = change.doc.id;

      if (change.type === "added") {
        const shapeData = { id: docId, ...docData };
        // Patikriname ar jau neegzistuoja, kad išvengti dubliavimosi
        if (!shapes.some(s => s.id === docId)) {
          shapes.push(shapeData);
        }
      }
      if (change.type === "modified") {
        const index = shapes.findIndex(s => s.id === docId);
        if (index !== -1) {
          shapes[index] = { id: docId, ...docData };
        }
      }
      if (change.type === "removed") {
        const index = shapes.findIndex(s => s.id === docId);
        if (index !== -1) {
          shapes.splice(index, 1);
        }
      }
    });
    saveStatus.value = 'saved';
  });

  // ResizeObserver kodas lieka toks pat
  let resizeObserver = null;
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      stageConfig.value.width = width;
      stageConfig.value.height = height;
    });
    resizeObserver.observe(containerRef.value);
  }

  onUnmounted(() => {
    if (unsubscribe) unsubscribe(); // Atsisakome prenumeratos
    if (resizeObserver && containerRef.value) {
      resizeObserver.unobserve(containerRef.value);
    }
  });
});

// ----- Įrankių juostos funkcijos -----
const addRect = async () => {
  const stage = stageRef.value.getStage();
  if (!stage) return;
  
  saveStatus.value = 'saving';
  const centerX = (stage.width() / 2 - stage.x()) / stage.scaleX();
  const centerY = (stage.height() / 2 - stage.y()) / stage.scaleY();
  
  const newShapeData = {
    component: 'v-rect',
    config: {
      x: centerX, y: centerY, width: 100, height: 50, fill: 'skyblue', draggable: true,
      offsetX: 50, offsetY: 25,
    }
  };
  
  // Pridedame `id` konfigūracijoje prieš siunčiant į DB, bet pats ID bus sugeneruotas DB.
  // Geresnė praktika yra `id` priskirti tik gavus jį iš onSnapshot.
  await addShape(canvasId.value, newShapeData);
  // Nereikia rankiniu būdu pridėti į `shapes` masyvą, `onSnapshot` tai padarys.
};

// ----- Interaktyvumas -----
const handleDragEnd = async (e) => {
  const shapeId = e.target.id();
  const shape = shapes.find((s) => s.id === shapeId);
  if (shape) {
    saveStatus.value = 'saving';
    await updateShape(canvasId.value, shapeId, {
      ...shape, // Siunčiame visus duomenis
      config: { ...shape.config, x: e.target.x(), y: e.target.y() } // Bet atnaujiname poziciją
    });
  }
};

// ----- Drobės navigacija -----
const handleWheel = (e) => {
  e.evt.preventDefault();
  const stage = stageRef.value.getStage();
  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition();
  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };
  const scaleBy = 1.05;
  const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
  const finalScale = Math.max(0.1, Math.min(newScale, 10));
  stageConfig.value.scaleX = finalScale;
  stageConfig.value.scaleY = finalScale;
  stageConfig.value.x = pointer.x - mousePointTo.x * finalScale;
  stageConfig.value.y = pointer.y - mousePointTo.y * finalScale;
};
</script>

<style scoped>
.canvas-container { height: 100vh; width: 100%; overflow: hidden; background-color: #1f1f1f; position: relative; }
</style>