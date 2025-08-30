import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import FileTreePage from '@/views/FileTreePage.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/filetree', component: FileTreePage }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;