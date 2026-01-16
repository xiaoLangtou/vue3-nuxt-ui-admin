<script lang="ts" setup>
import { BestSellingWidget, NotificationsWidget, RecentSalesWidget, RevenueStreamWidget, StatsWidget } from './components';
</script>

<template>
  <div class="grid grid-cols-12 gap-4">
    <StatsWidget />

    <div class="col-span-12 xl:col-span-6 flex flex-col gap-4">
      <RecentSalesWidget />
      <BestSellingWidget />
    </div>
    <div class="col-span-12 xl:col-span-6 flex flex-col gap-4">
      <RevenueStreamWidget />
      <NotificationsWidget />
    </div>
  </div>
</template>
