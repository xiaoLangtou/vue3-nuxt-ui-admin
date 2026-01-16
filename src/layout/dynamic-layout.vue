<script setup>
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useLayoutStore } from '@/stores/layout';
import DefaultLayout from './default-layout/app-layout.vue';
import TopbarLayout from './topbar-layout/app-layout.vue';

const layoutStore = useLayoutStore();
const { layoutConfig, layoutState } = storeToRefs(layoutStore);

const currentLayout = computed(() => {
  switch (layoutConfig.value.layoutMode) {
    case 'topbar':
      return TopbarLayout;
    default:
      return DefaultLayout;
  }
});
</script>

<template>
  <component :is="currentLayout" />
</template>
