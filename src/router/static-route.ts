// src/router/static-route.ts
import type { RouteRecordRaw } from 'vue-router';
import DynamicLayout from '@/layout/dynamic-layout.vue';

const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    component: DynamicLayout,
    redirect: '/dashboard',
    meta: {
      title: '仪表盘',

    },
    children: [
      {
        path: 'dashboard', // ✅ 相对路径
        name: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '仪表盘',
          icon:"Lucide-Gauge"
        },
      },
    ],
  },

  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      title: '登录',
    },
  },

  {
    path: '/403',
    name: '403',
    component: () => import('@/views/error-page/forbidden.vue'),
    meta: {
      title: '无权限',
    },
  },

  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error-page/not-found.vue'),
    meta: {
      title: '页面不存在',
    },
  },

  {
    path: '/503',
    name: '503',
    component: () => import('@/views/error-page/service-unavailable.vue'),
    meta: {
      title: '服务不可用',
    },
  },
];

export default staticRoutes;
