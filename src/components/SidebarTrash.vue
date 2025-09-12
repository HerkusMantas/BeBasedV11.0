<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';

// Kintamasis šiukšlinės elementams saugoti
const trashItems = ref([]);

// Emit funkcija, skirta "pranešti" tėviniam komponentui apie įvykį
const emit = defineEmits(['itemRestored']);

// Komponentui užsikrovus, atsisiunčiame ištrintus elementus iš Firebase
onMounted(async () => {
  const querySnapshot = await getDocs(collection(db, "deletedItems"));
  trashItems.value = [];
  querySnapshot.forEach((doc) => {
    // Kiekvienam elementui priskiriame unikalų ID iš `deletedItems` kolekcijos
    // ir išsaugome visus originalius duomenis
    trashItems.value.push({ firebaseId: doc.id, ...doc.data() });
  });
});

/**
 * Atkuria elementą: įrašo jį atgal į originalią kolekciją ('folders' arba 'canvases')
 * ir ištrina iš šiukšlinės.
 * @param {object} item - elementas, kurį reikia atkurti.
 */
async function restoreItem(item) {
  try {
    // Nustatome, į kurią kolekciją ('folders' ar 'canvases') reikia atkurti
    const collectionName = item.type === 'folder' ? 'folders' : 'canvases';

    // Sukuriame "švarų" objektą be šiukšlinei skirtų metaduomenų
    const dataToRestore = {
      type: item.type,
      key: item.key,
      label: item.label,
      icon: item.icon,
      iconColor: item.iconColor,
      parentKey: item.parentKey,
      rating: item.rating,
      showButton: item.showButton
    };

    // ✨ PATOBULINIMAS: Jei atkuriame aplanką, pridedame jam tuščią vaikų masyvą.
    if (collectionName === 'folders') {
      dataToRestore.children = [];
    }
    
    // Naudojame setDoc, kad atkurtume dokumentą SU TUO PAČIU ORIGINALiu ID (item.key)
    await setDoc(doc(db, collectionName, item.key), dataToRestore);
    
    // Ištriname elementą iš "deletedItems" kolekcijos
    await deleteDoc(doc(db, "deletedItems", item.firebaseId));
    
    // Atnaujiname lokalų sąrašą UI (greičiau nei siųstis iš naujo)
    trashItems.value = trashItems.value.filter(i => i.firebaseId !== item.firebaseId);
    
    // Išsiunčiame signalą tėviniam komponentui, kad medis atsinaujintų
    emit('itemRestored');

  } catch (e) {
    console.error("Klaida atkuriant elementą:", e);
  }
}

/**
 * Ištrina elementą iš šiukšlinės visam laikui.
 * @param {object} item - elementas, kurį reikia ištrinti.
 */
async function deleteForever(item) {
  try {
    // Ištriname dokumentą iš "deletedItems" kolekcijos pagal jo ID
    await deleteDoc(doc(db, "deletedItems", item.firebaseId));
    
    // Atnaujiname sąrašą vartotojo sąsajoje
    trashItems.value = trashItems.value.filter(i => i.firebaseId !== item.firebaseId);
  } catch (e) {
    console.error("Klaida trinant elementą visam laikui:", e);
  }
}
</script>

<template>
  <div>
    <h2>Recycle Bin</h2>
    <div v-if="trashItems.length === 0" class="empty-trash-message">
      The recycle bin is empty.
    </div>
    <div v-else>
      <div v-for="item in trashItems" :key="item.firebaseId" class="trash-item">
        <div class="item-info">
          <i :class="item.icon" style="margin-right: 8px;"></i>
          <span class="item-label">{{ item.label }}</span>
        </div>
        <div class="item-actions">
          <button @click="restoreItem(item)" class="button-restore">Restore</button>
          <button @click="deleteForever(item)" class="button-delete">Delete forever</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trash-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}
.item-label {
  font-weight: bold;
}
.item-actions button {
  margin-left: 8px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 4px;
}
.button-restore {
  color: #22c55e; /* green-500 */
}
.button-delete {
  color: #ef4444; /* red-500 */
}
.empty-trash-message {
  color: #6b7280; /* gray-500 */
  padding: 20px;
  text-align: center;
}
</style>