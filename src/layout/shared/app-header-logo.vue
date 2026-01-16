<script lang="ts" setup>
defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
});
const router = useRouter();
function handleLogoClick() {
  router.push('/');
}
</script>

<template>
  <div v-if="!collapsed" class="flex items-center gap-2 cursor-pointer" @click="handleLogoClick">
    <!-- Logo图标 -->
    <div class="bg-white dark:bg-neutral-800 p-1 rounded-lg shadow-sm border border-gray-200/60 dark:border-gray-700/60">
      <img alt="TVA Logo" class="w-8 h-8" src="@/assets/images/logo.svg">
    </div>

    <!-- 品牌信息 -->
    <div class="flex items-center gap-1">
      <span class="font-bold tracking-wide flex items-baseline gap-1" style="font-size: 20px">
        <em class="not-italic bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent transition-all duration-300 dark:from-blue-400 dark:to-blue-300 hover:from-blue-700 hover:to-blue-600 dark:hover:from-blue-300 dark:hover:to-blue-200">Tva</em>
        <em class="text-sm not-italic text-gray-600 dark:text-gray-400">Admin</em>
      </span>
    </div>
  </div>
  <div v-else class="bg-white dark:bg-neutral-800 p-2 rounded-lg shadow-sm border border-gray-200/60 dark:border-gray-700/60 hover:shadow-md transition-shadow duration-200" @click="handleLogoClick">
    <img alt="TVA" class="w-6 h-6" src="@/assets/images/logo.svg">
  </div>
</template>
