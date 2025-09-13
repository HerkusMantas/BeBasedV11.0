import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCanvasStore = defineStore('canvas', () => {
  // Būsena
  const elements = ref([])
  elements.value.push({id: 'store-test', x: 0, y: 0, width: 120, height: 80, content: 'STORE TEST'}) // Test element
  const connections = ref([])
  const pan = ref({ x: 0, y: 0 })
  const zoom = ref(1)

  // Getters (pvz., aktyvus elementas)
  const activeElement = computed(() => {
    return elements.value.find(e => e.isActive)
  })
  // Getter su fallback, kad pan.value visada būtų {x, y}
  const safePan = computed(() => {
    if (!pan.value || typeof pan.value.x !== 'number' || typeof pan.value.y !== 'number') {
      return { x: 0, y: 0 }
    }
    return pan.value
  })

  // Actions
  function addElement(element) {
    if (!Array.isArray(elements.value)) {
      elements.value = []
    }
    elements.value.push(element)
  }
  function updateElementPosition(id, x, y) {
    if (!Array.isArray(elements.value)) {
      elements.value = []
    }
    const el = elements.value.find(e => e.id === id)
    if (el) {
      el.x = x
      el.y = y
    }
  }

  // Saugiklis: jei elements.value ne masyvas, grąžinam null
  const safeActiveElement = computed(() => {
    if (!Array.isArray(elements.value)) return null;
    return elements.value.find(e => e.isActive)
  })
  // Saugus būdas atnaujinti pan ir zoom, kad nebūtų TypeError
  function setPan(x, y) {
    // Saugiklis: jei x arba y undefined, priskiriam 0
    if (typeof x !== 'number' || typeof y !== 'number') {
      pan.value = { x: 0, y: 0 }
    } else {
      pan.value = { x, y }
    }
  }
  function setZoom(val) {
    if (zoom && typeof zoom.value !== 'undefined') {
      zoom.value = val
    }
  }
  // ...kiti veiksmai...

  // Eksportuojam visus state, getterius ir actionus
  return { elements, connections, pan, zoom, activeElement, safeActiveElement, safePan, addElement, updateElementPosition, setPan, setZoom }
})