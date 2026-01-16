<script setup lang="ts">
const items = [
  [{
    label: 'Add New',
    icon: 'i-lucide-plus'
  }],
  [{
    label: 'Remove',
    icon: 'i-lucide-trash'
  }]
];
</script>

<template>
  <UCard class="flex flex-col">
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="font-semibold text-xl text-gray-900 dark:text-white">
          Best Selling Products
        </h3>
        <UDropdownMenu :items="items" :ui="{ content: 'w-40' }">
          <UButton
            icon="i-lucide-ellipsis-vertical"
            color="gray"
            variant="ghost"
            class="rounded-full"
          />
        </UDropdownMenu>
      </div>
    </template>

    <ul class="list-none p-0 m-0 space-y-6">
      <li class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <span class="text-gray-900 dark:text-white font-medium mr-2 mb-1 md:mb-0">Space T-Shirt</span>
          <div class="mt-1 text-gray-500 dark:text-gray-400">
            Clothing
          </div>
        </div>
        <div class="mt-2 md:mt-0 flex items-center">
          <div class="bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden w-40 lg:w-24 h-2">
            <div class="bg-orange-500 h-full" style="width: 50%" />
          </div>
          <span class="text-orange-500 ml-4 font-medium">%50</span>
        </div>
      </li>
      <li class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <span class="text-gray-900 dark:text-white font-medium mr-2 mb-1 md:mb-0">Portal Sticker</span>
          <div class="mt-1 text-gray-500 dark:text-gray-400">
            Accessories
          </div>
        </div>
        <div class="mt-2 md:mt-0 ml-0 md:ml-20 flex items-center">
          <div class="bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden w-40 lg:w-24 h-2">
            <div class="bg-cyan-500 h-full" style="width: 16%" />
          </div>
          <span class="text-cyan-500 ml-4 font-medium">%16</span>
        </div>
      </li>
      <li class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <span class="text-gray-900 dark:text-white font-medium mr-2 mb-1 md:mb-0">Supernova Sticker</span>
          <div class="mt-1 text-gray-500 dark:text-gray-400">
            Accessories
          </div>
        </div>
        <div class="mt-2 md:mt-0 ml-0 md:ml-20 flex items-center">
          <div class="bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden w-40 lg:w-24 h-2">
            <div class="bg-pink-500 h-full" style="width: 67%" />
          </div>
          <span class="text-pink-500 ml-4 font-medium">%67</span>
        </div>
      </li>
      <li class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <span class="text-gray-900 dark:text-white font-medium mr-2 mb-1 md:mb-0">Wonders Notebook</span>
          <div class="mt-1 text-gray-500 dark:text-gray-400">
            Office
          </div>
        </div>
        <div class="mt-2 md:mt-0 ml-0 md:ml-20 flex items-center">
          <div class="bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden w-40 lg:w-24 h-2">
            <div class="bg-green-500 h-full" style="width: 35%" />
          </div>
          <span class="text-primary-500 ml-4 font-medium">%35</span>
        </div>
      </li>
      <li class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <span class="text-gray-900 dark:text-white font-medium mr-2 mb-1 md:mb-0">Mat Black Case</span>
          <div class="mt-1 text-gray-500 dark:text-gray-400">
            Accessories
          </div>
        </div>
        <div class="mt-2 md:mt-0 ml-0 md:ml-20 flex items-center">
          <div class="bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden w-40 lg:w-24 h-2">
            <div class="bg-purple-500 h-full" style="width: 75%" />
          </div>
          <span class="text-purple-500 ml-4 font-medium">%75</span>
        </div>
      </li>
      <li class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <span class="text-gray-900 dark:text-white font-medium mr-2 mb-1 md:mb-0">Robots T-Shirt</span>
          <div class="mt-1 text-gray-500 dark:text-gray-400">
            Clothing
          </div>
        </div>
        <div class="mt-2 md:mt-0 ml-0 md:ml-20 flex items-center">
          <div class="bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden w-40 lg:w-24 h-2">
            <div class="bg-teal-500 h-full" style="width: 40%" />
          </div>
          <span class="text-teal-500 ml-4 font-medium">%40</span>
        </div>
      </li>
    </ul>
  </UCard>
</template>
