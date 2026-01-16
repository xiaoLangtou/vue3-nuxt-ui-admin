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
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-xl text-gray-900 dark:text-white">
          Notifications
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

    <span class="block text-gray-500 dark:text-gray-400 font-medium mb-4">TODAY</span>
    <ul class="p-0 mx-0 mt-0 mb-6 list-none space-y-2">
      <li class="flex items-center py-2 border-b border-gray-200 dark:border-gray-800">
        <div class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/20 rounded-full mr-4 shrink-0">
          <UIcon name="i-lucide-dollar-sign" class="text-blue-500 w-5 h-5" />
        </div>
        <span class="text-gray-900 dark:text-white leading-normal">Richard Jones
          <span class="text-gray-700 dark:text-gray-300">has purchased a blue t-shirt for <span class="text-primary-500 font-bold">$79.00</span></span>
        </span>
      </li>
      <li class="flex items-center py-2">
        <div class="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-900/20 rounded-full mr-4 shrink-0">
          <UIcon name="i-lucide-download" class="text-orange-500 w-5 h-5" />
        </div>
        <span class="text-gray-700 dark:text-gray-300 leading-normal">Your request for withdrawal of <span class="text-primary-500 font-bold">$2500.00</span> has been initiated.</span>
      </li>
    </ul>

    <span class="block text-gray-500 dark:text-gray-400 font-medium mb-4">YESTERDAY</span>
    <ul class="p-0 m-0 list-none mb-6 space-y-2">
      <li class="flex items-center py-2 border-b border-gray-200 dark:border-gray-800">
        <div class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/20 rounded-full mr-4 shrink-0">
          <UIcon name="i-lucide-dollar-sign" class="text-blue-500 w-5 h-5" />
        </div>
        <span class="text-gray-900 dark:text-white leading-normal">Keyser Wick
          <span class="text-gray-700 dark:text-gray-300">has purchased a black jacket for <span class="text-primary-500 font-bold">$59.00</span></span>
        </span>
      </li>
      <li class="flex items-center py-2 border-b border-gray-200 dark:border-gray-800">
        <div class="w-12 h-12 flex items-center justify-center bg-pink-100 dark:bg-pink-900/20 rounded-full mr-4 shrink-0">
          <UIcon name="i-lucide-circle-help" class="text-pink-500 w-5 h-5" />
        </div>
        <span class="text-gray-900 dark:text-white leading-normal">Jane Davis
          <span class="text-gray-700 dark:text-gray-300">has posted a new questions about your product.</span>
        </span>
      </li>
    </ul>
    <span class="block text-gray-500 dark:text-gray-400 font-medium mb-4">LAST WEEK</span>
    <ul class="p-0 m-0 list-none space-y-2">
      <li class="flex items-center py-2 border-b border-gray-200 dark:border-gray-800">
        <div class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-900/20 rounded-full mr-4 shrink-0">
          <UIcon name="i-lucide-arrow-up" class="text-green-500 w-5 h-5" />
        </div>
        <span class="text-gray-900 dark:text-white leading-normal">Your revenue has increased by <span class="text-primary-500 font-bold">%25</span>.</span>
      </li>
      <li class="flex items-center py-2 border-b border-gray-200 dark:border-gray-800">
        <div class="w-12 h-12 flex items-center justify-center bg-purple-100 dark:bg-purple-900/20 rounded-full mr-4 shrink-0">
          <UIcon name="i-lucide-heart" class="text-purple-500 w-5 h-5" />
        </div>
        <span class="text-gray-900 dark:text-white leading-normal"><span class="text-primary-500 font-bold">12</span> users have added your products to their wishlist.</span>
      </li>
    </ul>
  </UCard>
</template>
