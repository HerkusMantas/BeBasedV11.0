import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import FileTreePage from '@/views/FileTreePage.vue';
import LogIn from '@/views/LogIn.vue';
import SignUp from '@/views/SignUp.vue';

const routes = [
  { path: '/', component: LogIn },
  { path: '/signup', component: SignUp },
  { path: '/home', component: Home },
  { path: '/filetree', component: FileTreePage },
  {
    path: '/canvas/:id',
    name: 'Canvas',
    component: () => import('@/views/Canvas.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;