// SidebarTrash.vue
<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';

const trashItems = ref([]);

onMounted(async () => {
  const querySnapshot = await getDocs(collection(db, "deletedItems"));
  trashItems.value = [];
  querySnapshot.forEach((doc) => {
    trashItems.value.push({ key: doc.id, firebaseId: doc.id, ...doc.data() });
  });
});

async function restoreItem(item) {
  // Įrašyti atgal į pagrindinę kolekciją
  const collectionName = item.icon === 'pi pi-fw pi-folder' ? 'folders' : 'canvases';
  const { pathToRoot, siblings, children, ...rest } = item; // pašalinti papildomą info
  await addDoc(collection(db, collectionName), rest);
  // Ištrinti iš trash kolekcijos
  await deleteDoc(doc(db, "deletedItems", item.firebaseId));
  // Pašalinti iš trashItems lokaliai
  trashItems.value = trashItems.value.filter(i => i.firebaseId !== item.firebaseId);
}

async function deleteForever(item) {
  try {
    await deleteDoc(doc(db, "deletedItems", item.firebaseId));
    // Po trynimo iš naujo užkrauname trashItems iš Firestore
    const querySnapshot = await getDocs(collection(db, "deletedItems"));
    trashItems.value = [];
    querySnapshot.forEach((doc) => {
      trashItems.value.push({ key: doc.id, firebaseId: doc.id, ...doc.data() });
    });
    console.log('Po trynimo trashItems:', trashItems.value.map(i => i.firebaseId));
  } catch (e) {
    console.error("Klaida trynant iš trash:", e, item.firebaseId);
  }
}
</script>

<template>
  <div>
    <h2>Trash Sidebar</h2>
    <div v-if="trashItems.length === 0">Šiukšlinė tuščia.</div>
  <div v-for="item in trashItems" :key="item.firebaseId" class="trash-item">
      <h3>{{ item.label }} <span v-if="item.icon">({{ item.icon }})</span></h3>
      <div>Rating: {{ item.rating }}</div>
      <!-- Galite rodyti kelią iki root, brolius, vaikus, jei juos įrašote -->
      <button @click="restoreItem(item)">Atkurti</button>
    <button @click="deleteForever(item)" style="margin-left:8px;color:red">Ištrinti visam</button>
      <hr />
    </div>
  </div>
</template>