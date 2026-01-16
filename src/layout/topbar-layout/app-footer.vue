<script setup></script>

<template>
  <footer class="py-6 px-4 bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
    <div class="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
      <div class="flex items-center gap-1">
        <span>&copy; {{ new Date().getFullYear() }}</span>
        <span class="font-medium text-gray-900 dark:text-white">Nuxt UI Admin</span>
        <span>. All rights reserved.</span>
      </div>
      <div class="flex items-center gap-6">
        <a href="#" class="hover:text-primary-500 transition-colors">Privacy Policy</a>
        <a href="#" class="hover:text-primary-500 transition-colors">Terms of Service</a>
        <a href="https://github.com/weipengcheng" target="_blank" class="hover:text-primary-500 transition-colors flex items-center gap-1">
          <UIcon name="i-simple-icons-github" class="w-4 h-4" />
          GitHub
        </a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
</style>
