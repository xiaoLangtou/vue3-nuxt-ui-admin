<script setup lang="ts">
import { useLucideIcon } from '@/composables/useLucideIcon';

const { isLucideIcon, lucideIconName } = useLucideIcon();

interface TreeNode {
    id: number | string;
    label?: string;
    name?: string;
    icon?: string;
    children?: TreeNode[];
    [key: string]: any;
}

interface Props {
    modelValue?: number | string | null;
    items: TreeNode[];
    placeholder?: string;
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
    placeholder: '请选择',
    disabled: false
});

const emit = defineEmits<{
    'update:modelValue': [value: number | string | null];
}>();

const isOpen = ref(false);

/**
 * 转换数据格式，确保有 label 字段
 */
const normalizeTreeData = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.map(node => ({
        ...node,
        label: node.label || node.name || '',
        children: node.children ? normalizeTreeData(node.children) : undefined
    }));
};

/**
 * 标准化后的树形数据
 */
const normalizedItems = computed(() => normalizeTreeData(props.items));

/**
 * 递归查找选中的节点
 */
const findNodeById = (nodes: TreeNode[], id: number | string | null): TreeNode | null => {
    if (!id) return null;

    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
};

/**
 * 当前选中的节点
 */
const selectedNode = computed(() => findNodeById(normalizedItems.value, props.modelValue));

/**
 * UTree 的 v-model 值
 */
const treeValue = ref<TreeNode | null>(null);

/**
 * 监听 treeValue 变化，更新 modelValue
 */
watch(treeValue, (newValue: TreeNode | null) => {
    if (newValue) {
        emit('update:modelValue', newValue.id);
        isOpen.value = false;
    }
});

/**
 * 监听 modelValue 变化，同步到 treeValue
 */
watch(() => props.modelValue, (newValue: number | string | null) => {
    if (newValue) {
        treeValue.value = findNodeById(normalizedItems.value, newValue);
    } else {
        treeValue.value = null;
    }
}, { immediate: true });
</script>

<template>
    <div class="w-full">
        <UPopover v-model:open="isOpen" :content="{ side: 'bottom', align: 'start', fitViewport: true }"
            :ui="{ content: 'w-[var(--reka-popover-trigger-width)]' }" mode="click">
            <UButton variant="outline" color="neutral" block :disabled="disabled" class="justify-between font-normal"
                :class="{ 'text-muted': !selectedNode }">
                <span class="truncate">{{ selectedNode?.label || placeholder }}</span>
                <UIcon name="i-lucide-chevron-down" class="w-4 h-4 transition-transform duration-200 shrink-0"
                    :class="{ 'rotate-180': isOpen }" />
            </UButton>
            <template #content>
                <div class="p-2 max-h-60 overflow-auto">
                    <UTree v-model="treeValue" :items="normalizedItems">
                        <template #item="{ item, expanded, handleToggle }">
                            <div class="flex items-center gap-2 w-full">
                                <!-- 展开图标（左边） -->
                                <UButton v-if="item.children && item.children.length > 0"
                                    :icon="expanded ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'" size="2xs"
                                    color="gray" variant="ghost" class="shrink-0" @click.stop="handleToggle" />
                                <div v-else class="w-5 shrink-0" />

                                <!-- 节点图标 -->
                                <component v-if="item.icon && isLucideIcon(item.icon)" :is="lucideIconName(item.icon)"
                                    :size="16" class="shrink-0" />
                                <UIcon v-else-if="item.icon" :name="item.icon" class="w-4 h-4 shrink-0" />

                                <!-- 节点标签 -->
                                <span class="truncate ">{{ item.label }}</span>
                            </div>
                        </template>
                    </UTree>
                </div>
            </template>
        </UPopover>
    </div>
</template>
