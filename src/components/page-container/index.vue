<script setup lang="ts">
interface Props {
  title?: string;
}
defineProps<Props>();
</script>

<template>
  <div class="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
    <div v-if="$slots.header || title" class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
      <h2 v-if="title" class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h2>
      <slot name="header" />
    </div>
    <div class="flex-1 p-6 overflow-auto">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
      <slot name="footer" />
    </div>
  </div>
</template>
