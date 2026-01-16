import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import setupPageGuard from '@/router/guard';
import staticRoute from './static-route';

const routes: RouteRecordRaw[] = [...staticRoute];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

setupPageGuard(router);

export default router;
