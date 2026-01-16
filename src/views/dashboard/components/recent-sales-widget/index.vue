<script setup lang="ts">

import { ProductService } from '@/views/dashboard/service/ProductService';

const products = ref(null);

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

const columns = [
  {
    key: 'image',
    label: 'Image',
  },
  {
    key: 'name',
    label: 'Name',
    sortable: true
  },
  {
    key: 'price',
    label: 'Price',
    sortable: true
  },
  {
    key: 'actions',
    label: 'View'
  }
];

onMounted(() => {
  ProductService.getProductsSmall().then(data => (products.value = data));
});
</script>

<template>
  <UCard class="flex flex-col">
    <template #header>
      <div class="font-semibold text-xl text-gray-900 dark:text-white">
        Recent Sales
      </div>
    </template>
  </UCard>
</template>
