import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页',
      icon: 'i-lucide-home',
    },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/views/UsersDemo.vue'),
    meta: {
      title: '用户管理',
      icon: 'i-lucide-users',
    },
  },
];
