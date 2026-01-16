<script lang="ts" setup>
import type { MenuOptions } from '@/services/types/menu';
import { useLucideIcon } from '@/composables';
import useMenuStore from '@/stores/menu';
import { storeToRefs } from 'pinia';

const router = useRouter();
const route = useRoute();
const menuStore = useMenuStore();
const { menuList } = storeToRefs(menuStore);
const { isLucideIcon, lucideIconName } = useLucideIcon();

const props = defineProps({
    isExpand: {
        type: Boolean,
        default: false
    }
})

/**
 * 递归过滤菜单
 */
function filterTreeMenu(menuItems: MenuOptions[]): MenuOptions[] {
    if (!menuItems || !Array.isArray(menuItems)) return [];

    return menuItems
        .filter(item => item && item.meta && !item.meta.isHide)
        .map(item => ({
            ...item,
            children: item.children ? filterTreeMenu(item.children) : undefined,
        }))
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

const filteredMenuItems = computed(() => {
    return filterTreeMenu(menuList.value);
});

onMounted(() => {
    if (menuList.value.length === 0) {
        menuStore.getAuthMenuList();
    }
});

/**
 * 判断菜单是否激活
 */
function isActive(item: MenuOptions): boolean {
    // 1. 如果有子菜单，递归检查子菜单是否激活
    if (item.children && item.children.length > 0) {
        return item.children.some(child => isActive(child));
    }

    // 2. 如果没有路径，肯定不是激活状态
    if (!item.path) return false;

    // 3. 精确匹配：如果是首页或者当前路由与菜单路径完全一致
    if (item.path === '/' || item.path === route.path) {
        return route.path === item.path;
    }

    // 4. 前缀匹配：如果当前路由以菜单路径开头
    return route.path.startsWith(item.path + '/');
}

function getNavigationItems(menuItems: MenuOptions[]) {
    return menuItems.map(item => {
        const navItem: any = {
            label: item.meta.title,
            value: item.path,
            originalIcon: item.meta.icon,
            icon: lucideIconName(item.meta.icon),
            active: isActive(item),
            defaultOpen: props.isExpand,
        };

        if (item.children && item.children.length > 0) {
            navItem.children = getNavigationItems(item.children);
        } else {
            if (item.meta?.iframeUrl) {
                navItem.onSelect = () => window.open(item.meta.iframeUrl, '_blank');
            } else if (item.path) {
                navItem.to = item.path;
            }
        }

        return navItem;
    });
}

const items = computed(() => getNavigationItems(filteredMenuItems.value));


const navigationMenuProps = computed(() => {
    return props.isExpand ? {
        items: items.value,
        arrow: props.isExpand,
        orientation: 'vertical',
    } : {
        items: items.value,
        arrow: props.isExpand,
        contentOrientation: 'vertical',
        highlightColor: 'primary',
        orientation: 'horizontal',
        class: 'justify-center',
    }
})

</script>

<template>
    <UNavigationMenu v-bind="navigationMenuProps">
    </UNavigationMenu>
</template>

<style scoped>
/* 移除不需要的 CSS */
</style>

<style scoped>
/* 移除不需要的 CSS */
</style>
