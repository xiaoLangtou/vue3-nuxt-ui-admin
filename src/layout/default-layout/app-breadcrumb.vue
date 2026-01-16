<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui';
import { useRoute } from 'vue-router';

const route = useRoute();
const { isLucideIcon, lucideIconName } = useLucideIcon();

const breadcrumbItems = computed((): BreadcrumbItem[] => {
    const matched = route.matched.filter(item => item.meta?.title);

    if (route.path === '/') {
        const homeRoute = matched.find(item => item.path === '/');
        return [{
            label: homeRoute?.meta?.title as string || '首页',
            to: '/',
            icon: isLucideIcon(homeRoute?.meta?.icon as string) ? lucideIconName(homeRoute?.meta?.icon as string) : "",
        }];
    }

    const homeRoute = matched.find(item => item.path === '/');
    const items: BreadcrumbItem[] = [{
        label: homeRoute?.meta?.title as string || '首页',
        to: '/',
        icon: 'i-lucide-home',
    }];

    const filteredMatched = matched.filter(item => item.path !== '/');
    filteredMatched.forEach((item, index) => {
        items.push({
            label: item.meta.title as string,
            to: index === filteredMatched.length - 1 ? undefined : item.path,
            icon: item.meta?.icon as string,
        });
    });

    return items;
});
</script>

<template>
    <UBreadcrumb :items="breadcrumbItems">
        <template #item="{ item }">
            <component :is="lucideIconName(item.icon)" v-if="isLucideIcon(item.icon)" :size="18" stroke-width="2px" />
            <UIcon v-else :name="item.icon"  class="w-5 h-5"/>
            <span>{{ item.label }}</span>
        </template>
    </UBreadcrumb>
</template>

<style lang="scss" scoped>
/* Nuxt UI Breadcrumb 已处理样式 */
</style>
