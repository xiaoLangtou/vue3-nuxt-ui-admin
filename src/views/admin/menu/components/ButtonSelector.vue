<script setup lang="ts">
import type { ButtonConfig } from '@/types/menu';
import { computed, ref, watch } from 'vue';

interface Props {
    /** 弹窗显示状态 */
    visible: boolean;
    /** 可选按钮 */
    buttons?: ButtonConfig[];
    /** 弹窗标题 */
    title: string;
    /** 描述文本 */
    description?: string;
    /** 抽屉宽度 */
    width?: string;
}

interface Emits {
    (e: 'update:visible', value: boolean): void;
    (e: 'confirm', buttons: ButtonConfig[]): void;
    (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
    buttons: () => [
        { id: '1', name: '查看', permission: 'view', icon: 'i-lucide-eye', sort: 1 },
        { id: '2', name: '新增', permission: 'add', icon: 'i-lucide-plus', sort: 2 },
        { id: '3', name: '编辑', permission: 'edit', icon: 'i-lucide-pencil', sort: 3 },
        { id: '4', name: '删除', permission: 'delete', icon: 'i-lucide-trash', sort: 4 },
        { id: '5', name: '导出', permission: 'export', icon: 'i-lucide-download', sort: 5 },
        { id: '6', name: '导入', permission: 'import', icon: 'i-lucide-upload', sort: 6 },
        { id: '7', name: '重置密码', permission: 'resetPassword', icon: 'i-lucide-key', sort: 7 },
        { id: '8', name: '分配角色', permission: 'assignRole', icon: 'i-lucide-users', sort: 8 },
        { id: '9', name: '启用', permission: 'enable', icon: 'i-lucide-check', sort: 9 },
        { id: '10', name: '禁用', permission: 'disable', icon: 'i-lucide-x', sort: 10 }
    ],
    title: '批量添加按钮',
    description: '选择的按钮将自动生成对应的权限标识和配置',
    width: '650px'
});

const emit = defineEmits<Emits>();

// 响应式状态
const selectedButtons = ref<string[]>([]);

// 计算属性
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});

const isAllSelected = computed(() => {
    return selectedButtons.value.length === props.buttons.length;
});

const toggleAllLabel = computed(() => {
    return isAllSelected.value ? '取消全选' : '全选';
});

const selectedButtonsCount = computed(() => {
    return selectedButtons.value.length;
});

// 方法
/**
 * 切换按钮选择状态
 * @param permission - 权限标识
 */
const toggleButtonSelection = (permission: string) => {
    const index = selectedButtons.value.indexOf(permission);
    if (index > -1) {
        selectedButtons.value.splice(index, 1);
    } else {
        selectedButtons.value.push(permission);
    }
};

/**
 * 切换全选状态
 */
const toggleAllButtons = () => {
    if (isAllSelected.value) {
        selectedButtons.value = [];
    } else {
        selectedButtons.value = props.buttons.map((btn) => btn.permission);
    }
};

/**
 * 确认添加按钮
 */
const confirmAddButtons = () => {
    const buttonsToAdd = props.buttons.filter((btn) => selectedButtons.value.includes(btn.permission));
    emit('confirm', buttonsToAdd);
    resetSelection();
};

/**
 * 取消操作
 */
const cancelOperation = () => {
    emit('cancel');
    resetSelection();
};

/**
 * 重置选择状态
 */
const resetSelection = () => {
    selectedButtons.value = [];
};

/**
 * 检查按钮是否被选中
 * @param permission - 权限标识
 * @returns 是否选中
 */
const isButtonSelected = (permission: string) => {
    return selectedButtons.value.includes(permission);
};

// 监听弹窗显示状态，重置选择
watch(
    () => props.visible,
    (newVisible) => {
        if (newVisible) {
            resetSelection();
        }
    }
);
</script>

<template>
    <UModal
        v-model:open="dialogVisible"
        :title="title"
        :description="description"
        :ui="{ content: 'max-w-2xl' }"
    >
        <template #body>
            <div class="space-y-3 max-h-[60vh] overflow-y-auto">
                <div
                    v-for="button in buttons"
                    :key="button.permission"
                    class="group flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200"
                    :class="[
                        isButtonSelected(button.permission)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 dark:border-primary-400 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    ]"
                    @click="toggleButtonSelection(button.permission)"
                >
                    <div class="flex items-center flex-1">
                        <div
                            class="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                            :class="isButtonSelected(button.permission) ? 'bg-primary-100 dark:bg-primary-900/20' : 'bg-gray-100 dark:bg-gray-800'"
                        >
                            <UIcon
                                :name="button.icon"
                                class="w-4 h-4"
                                :class="isButtonSelected(button.permission) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'"
                            />
                        </div>
                        <div>
                            <div class="font-medium text-gray-900 dark:text-white">{{ button.name }}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">权限：{{ button.permission }}</div>
                        </div>
                    </div>
                    <div class="ml-2">
                        <UIcon
                            :name="isButtonSelected(button.permission) ? 'i-lucide-check-circle-2' : 'i-lucide-circle'"
                            class="w-5 h-5 transition-all duration-200"
                            :class="[
                                isButtonSelected(button.permission)
                                    ? 'text-primary-500 scale-110'
                                    : 'text-gray-300 dark:text-gray-600 group-hover:text-gray-400'
                            ]"
                        />
                    </div>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-between items-center w-full">
                <div class="flex items-center gap-2">
                    <UButton
                        :label="toggleAllLabel"
                        size="sm"
                        color="neutral"
                        variant="outline"
                        icon="i-lucide-check-square"
                        @click="toggleAllButtons"
                    />
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                        <span v-if="selectedButtonsCount > 0">已选择 {{ selectedButtonsCount }} 个按钮</span>
                        <span v-else>请选择要添加的按钮</span>
                    </span>
                </div>
                <div class="flex gap-2">
                    <UButton
                        label="取消"
                        color="neutral"
                        variant="ghost"
                        @click="cancelOperation"
                    />
                    <UButton
                        label="确定添加"
                        color="primary"
                        icon="i-lucide-check"
                        :disabled="selectedButtonsCount === 0"
                        @click="confirmAddButtons"
                    />
                </div>
            </div>
        </template>
    </UModal>
</template>
