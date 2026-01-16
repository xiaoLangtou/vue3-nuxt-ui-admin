<script setup>
import { storeToRefs } from 'pinia';
import { useLayoutStore } from '@/stores/layout';

defineProps({
  isMobile: {
    type: Boolean,
    default: false,
  },
});

const layoutStore = useLayoutStore();
const { companyName, companyHomepage, date, icp, icpLink } = storeToRefs(layoutStore);
</script>

<template>
  <footer
    class="flex items-center justify-center p-4 bg-inherit text-sm text-gray-500 dark:text-gray-400 transition-all duration-300"
    :class="[isMobile ? 'h-auto py-2 flex-col gap-2' : 'h-12']"
  >
    <div class="w-full max-w-7xl flex items-center justify-center gap-2">
      <!-- 桌面端/通用布局 -->
      <div v-if="!isMobile" class="flex items-center gap-3">
        <span class="flex items-center gap-1">
          &copy; {{ date || new Date().getFullYear() }}
          <a
            v-if="companyHomepage"
            :href="companyHomepage"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-500 hover:text-primary-600 hover:underline font-medium"
          >
            {{ companyName }}
          </a>
          <span v-else>{{ companyName }}</span>
          版权所有
        </span>

        <span v-if="icp" class="text-gray-300 dark:text-gray-700">|</span>

        <span v-if="icp" class="flex items-center">
          <a
            v-if="icpLink"
            :href="icpLink"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-500 hover:text-primary-600 hover:underline font-medium"
          >
            {{ icp }}
          </a>
          <span v-else>{{ icp }}</span>
        </span>
      </div>

      <!-- 移动端布局 -->
      <div v-else class="flex flex-col items-center gap-1 text-xs">
        <div class="flex items-center gap-1 flex-wrap justify-center">
          &copy; {{ date || new Date().getFullYear() }}
          <a
            v-if="companyHomepage"
            :href="companyHomepage"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-500 hover:underline"
          >
            {{ companyName }}
          </a>
          <span v-else>{{ companyName }}</span>
        </div>
        
        <div v-if="icp">
          <a
            v-if="icpLink"
            :href="icpLink"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-500 hover:underline"
          >
            {{ icp }}
          </a>
          <span v-else>{{ icp }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>
