<script setup lang="ts">
import { IconSelector, TreeSelect } from '@/components';
import type { MenuFormData, MenuTreeNode, RouteMeta } from '@/types/menu';
import { MENU_TYPE_DICT } from '@/global/constants';
import { z } from 'zod';
import ButtonSelector from './ButtonSelector.vue';
const { isLucideIcon, lucideIconName } = useLucideIcon();

interface Props {
    visible: boolean;
    title: string;
    formData: MenuFormData;
    parentMenuOptions: MenuTreeNode[];
    loading?: boolean;
}

interface Emits {
    (e: 'update:visible', value: boolean): void;
    (e: 'update:formData', data: MenuFormData): void;
    (e: 'submit', data: MenuFormData): void;
    (e: 'close'): void;
    (e: 'reset'): void;
    (e: 'batchAddButtons', buttons: any[]): void;
}

const props = withDefaults(defineProps<Props>(), {
    loading: false
});

const emit = defineEmits<Emits>();
const toast = useToast();

// Zod 验证模式
const menuFormSchema = z.object({
    type: z.union([z.literal(0), z.literal(1)]).refine((val) => [0, 1].includes(val), {
        message: '请选择菜单类型'
    }),
    parentId: z.union([z.string(), z.number()]).optional(),
    name: z.string().min(1, '请输入菜单名称'),
    path: z.string().optional(),
    component: z.string().optional(),
    componentName: z.string().optional(),
    permission: z.string().optional(),
    icon: z.string().optional(),
    sort: z.number().min(0).max(9999).default(999),
    isKeepAlive: z.string().optional(),
    isHide: z.string().optional(),
    isIframe: z.string().optional(),
    buttons: z
        .array(
            z.object({
                name: z.string(),
                permission: z.string()
            })
        )
        .optional()
        .default([])
});

const buttonFormSchema = z.object({
    name: z.string().min(1, '请输入按钮名称'),
    permission: z.string().min(1, '请输入权限标识'),
    icon: z.string().optional(),
    sort: z.number().default(0)
});

const dialogVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value)
});

const showRouteFields = computed(() => state.value.type === 1);
const showRedirectField = computed(() => state.value.type === 0);

const state = ref({
    type: props.formData?.type ?? 1,
    parentId: props.formData?.parentId || undefined,
    name: props.formData?.name || '',
    path: props.formData?.path || '',
    component: props.formData?.component || '',
    componentName: props.formData?.componentName || '',
    permission: props.formData?.permission || '',
    icon: props.formData?.icon || '',
    sort: props.formData?.sort || 999,
    isKeepAlive: props.formData?.isKeepAlive || '0',
    isHide: props.formData?.isHide || '0',
    isIframe: props.formData?.isIframe || '0',
    buttons: props.formData?.buttons || []
});

watch(
    () => props.formData,
    (newData: MenuFormData) => {
        if (newData) {
            state.value = {
                type: newData.type ?? 1,
                parentId: newData.parentId || undefined,
                name: newData.name || '',
                path: newData.path || '',
                component: newData.component || '',
                componentName: newData.componentName || '',
                permission: newData.permission || '',
                icon: newData.icon || '',
                sort: newData.sort || 999,
                isKeepAlive: newData.isKeepAlive || '0',
                isHide: newData.isHide || '0',
                isIframe: newData.isIframe || '0',
                buttons: newData.buttons || []
            };
        }
    },
    { deep: true, immediate: true }
);

const formRef = ref();
const activeTab = ref(0);

const closeDialog = () => {
    dialogVisible.value = false;
};

const onSubmit = async () => {
    try {
        await formRef.value.validate();
        emit('submit', { ...state.value, id: props.formData?.id });
    } catch (error) {
        console.error('表单验证失败', error);
    }
};

const handleReset = () => {
    if (confirm('确定要重置表单吗？所有未保存的数据将丢失')) {
        emit('reset');
        toast.add({
            title: '已重置',
            description: '表单已重置为初始状态',
            color: 'success'
        });
    }
};

const menuTypeOptions = [
    { label: MENU_TYPE_DICT['0'], value: 0, icon: 'i-lucide-folder' },
    { label: MENU_TYPE_DICT['1'], value: 1, icon: 'i-lucide-file' },
];

const statusOptions = [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 }
];

const visibleOptions = [
    { label: '显示', value: true },
    { label: '隐藏', value: false }
];

// 标签页配置
const tabs = computed(() => {
    const baseTabs = [
        { key: 'basic', label: '路由配置', icon: 'i-lucide-route', slot: 'basic' }
    ];

    baseTabs.push(
        { key: 'buttons', label: '按钮权限', icon: 'i-lucide-mouse-pointer-click', slot: 'buttons' },
        { key: 'advanced', label: '高级设置', icon: 'i-lucide-settings', slot: 'advanced' }
    );

    return baseTabs;
});

// 按钮管理
const batchButtonVisible = ref(false);
const customButtonVisible = ref(false);
const editingButtonIndex = ref(-1);
const buttonFormRef = ref();
const customButtonForm = ref({
    name: '',
    permission: '',
    icon: 'i-lucide-circle',
    sort: 0
});

const generateId = () => Date.now() + Math.random();
const buttonsCount = computed(() => state.value.buttons?.length || 0);

const openBatchButtonDialog = () => {
    batchButtonVisible.value = true;
};

const confirmBatchAddButtons = (buttonsToAdd: any[]) => {
    if (!state.value.buttons) {
        state.value.buttons = [];
    }

    buttonsToAdd.forEach((button) => {
        const newButton = {
            id: generateId(),
            name: button.name,
            permission: button.permission,
            icon: button.icon,
            sort: button.sort
        };
        state.value.buttons.push(newButton);
    });

    batchButtonVisible.value = false;
    toast.add({
        title: '成功',
        description: `已添加 ${buttonsToAdd.length} 个按钮`,
        color: 'success'
    });
};

const openCustomButtonDialog = () => {
    editingButtonIndex.value = -1;
    customButtonForm.value = {
        name: '',
        permission: '',
        icon: 'i-lucide-circle',
        sort: 0
    };
    customButtonVisible.value = true;
};

const editButton = (index: number) => {
    const button = state.value.buttons?.[index];
    if (button) {
        editingButtonIndex.value = index;
        customButtonForm.value = {
            name: button.name,
            permission: button.permission,
            icon: button.icon,
            sort: button.sort
        };
        customButtonVisible.value = true;
    }
};

const removeButton = (index: number) => {
    if (state.value.buttons) {
        state.value.buttons.splice(index, 1);
        toast.add({
            title: '已删除',
            description: '按钮已删除',
            color: 'success'
        });
    }
};

const confirmCustomButton = async () => {
    try {
        await buttonFormRef.value.validate();

        if (!state.value.buttons) {
            state.value.buttons = [];
        }

        const buttonData = {
            id: editingButtonIndex.value >= 0 ? state.value.buttons[editingButtonIndex.value].id : generateId(),
            name: customButtonForm.value.name.trim(),
            permission: customButtonForm.value.permission.trim(),
            icon: customButtonForm.value.icon,
            sort: customButtonForm.value.sort
        };

        if (editingButtonIndex.value >= 0) {
            state.value.buttons[editingButtonIndex.value] = buttonData;
        } else {
            state.value.buttons.push(buttonData);
        }

        customButtonVisible.value = false;
        toast.add({
            title: '成功',
            description: editingButtonIndex.value >= 0 ? '按钮编辑成功' : '按钮添加成功',
            color: 'success'
        });
    } catch (error) {
        console.error('按钮表单验证失败', error);
    }
};

const cancelCustomButton = () => {
    customButtonVisible.value = false;
};
</script>

<template>
    <USlideover v-model:open="dialogVisible" :title="title" :ui="{ content: 'max-w-[800px]', body: { padding: 'p-0' } }"
        prevent-close>
        <template #body>
            <UForm ref="formRef" :schema="menuFormSchema" :state="state" @submit="onSubmit">
                <UTabs :items="tabs" class="w-full">
                    <!-- 基础信息 -->
                    <template #basic>
                        <div class="p-6">
                            <div class="grid grid-cols-2 gap-4">
                                <UFormField label="菜单类型" name="type" required>
                    
                                    <USelectMenu v-model="state.type" :items="menuTypeOptions" valueKey="value"
                                        labelKey="label" placeholder="选择类型" class="w-full">
                                        <template #option="{ option }">
                                            <div class="flex items-center gap-2">
                                                <UIcon :name="option.icon" class="w-4 h-4" />
                                                <span>{{ option.label }}</span>
                                            </div>
                                        </template>
                                    </USelectMenu>
                                </UFormField>

                                <UFormField label="上级菜单" name="parentId">
                                    <TreeSelect v-model="state.parentId" :items="parentMenuOptions" placeholder="请选择上级菜单"
                                        class="w-full" />
                                </UFormField>

                                <UFormField label="菜单名称" name="name" required>
                                    <UInput v-model="state.name" placeholder="请输入名称" class="w-full" />
                                </UFormField>

                                <UFormField v-if="state.type === 0 || state.type === 1" label="路由地址" name="path">
                                    <UInput v-model="state.path" placeholder="请输入路由地址" class="w-full" />
                                </UFormField>

                                <UFormField v-if="state.type === 1" label="组件路径" name="component">
                                    <UInput v-model="state.component" placeholder="请输入组件路径" class="w-full" />
                                </UFormField>

                                <UFormField v-if="state.type === 1" label="组件名称" name="componentName">
                                    <UInput v-model="state.componentName" placeholder="请输入组件英文名称" class="w-full" />
                                </UFormField>

                                <UFormField v-if="state.type === 1" label="权限标识" name="permission">
                                    <UInput v-model="state.permission" placeholder="请输入权限标识" class="w-full" />
                                </UFormField>

                                <UFormField v-if="state.type === 0 || state.type === 1" label="菜单图标" name="icon">
                                    <IconSelector v-model="state.icon" placeholder="选择图标" class="w-full" />
                                </UFormField>

                                <UFormField label="显示排序" name="sort">
                                    <UInput v-model.number="state.sort" type="number" placeholder="0" class="w-full" />
                                </UFormField>

                                <template v-if="state.type === 0 || state.type === 1">
                                    <UFormField label="是否缓存" name="isKeepAlive">
                                        <USelectMenu v-model="state.isKeepAlive" :items="[{label:'是',value:'1'},{label:'否',value:'0'}]" value-attribute="value" option-attribute="label" class="w-full" />
                                    </UFormField>

                                    <UFormField label="是否隐藏" name="isHide">
                                        <USelectMenu v-model="state.isHide" :items="[{label:'显示',value:'1'},{label:'隐藏',value:'0'}]" value-attribute="value" option-attribute="label" class="w-full" />
                                    </UFormField>

                                    <UFormField label="是否外链" name="isIframe">
                                        <USelectMenu v-model="state.isIframe" :items="[{label:'是',value:'1'},{label:'否',value:'0'}]" value-attribute="value" option-attribute="label" class="w-full" />
                                    </UFormField>
                                </template>
                            </div>
                        </div>
                    </template>

                    <!-- 按钮权限 -->
                    <template #buttons>
                        <div class="p-6 space-y-4">
                            <!-- 目录类型禁用提示 -->
                            <UAlert v-if="state.type === 0" icon="i-lucide-info" color="primary"
                                variant="soft" title="提示" description="目录类型不支持配置按钮权限，请在子菜单中配置。" />

                            <div v-else class="flex items-center justify-between">
                                <p class="text-sm text-gray-600 dark:text-gray-400">
                                    为当前菜单配置操作按钮和权限
                                </p>
                                <div class="flex gap-2">
                                    <UButton icon="i-lucide-zap" size="sm" label="快速添加" variant="soft"
                                        @click="openBatchButtonDialog" />
                                    <UButton icon="i-lucide-plus" size="sm" label="自定义" variant="outline"
                                        @click="openCustomButtonDialog" />
                                </div>
                            </div>

                            <template v-if="state.type !== 0">
                                <!-- 按钮列表 -->
                                <div v-if="buttonsCount > 0" class="space-y-2">
                                    <div class="text-xs text-gray-500 mb-2">
                                        共 {{ buttonsCount }} 个按钮
                                    </div>

                                    <div
                                        class="divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                                        <div v-for="(button, index) in state.buttons" :key="button.id || index"
                                            class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                            <div class="flex items-center gap-3 flex-1 min-w-0">
                                                <UIcon :name="button.icon"
                                                    class="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <div class="flex-1 min-w-0">
                                                    <div
                                                        class="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {{ button.name }}
                                                    </div>
                                                    <code class="text-xs text-gray-500 dark:text-gray-400">
                                                        {{ button.permission }}
                                                    </code>
                                                </div>
                                            </div>
                                            <div
                                                class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <UButton icon="i-lucide-pencil" size="xs" color="gray" variant="ghost"
                                                    @click="editButton(index)" />
                                                <UButton icon="i-lucide-trash" size="xs" color="red" variant="ghost"
                                                    @click="removeButton(index)" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- 空状态 -->
                                <div v-else
                                    class="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                                    <UIcon name="i-lucide-mouse-pointer-click"
                                        class="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
                                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">暂无按钮</p>
                                    <p class="text-xs text-gray-400">点击上方按钮添加</p>
                                </div>
                            </template>
                        </div>
                    </template>

                    <!-- 高级设置 -->
                    <template #advanced>
                        <div class="p-6 space-y-4">
                            <div class="grid grid-cols-3 gap-4">
                                <UFormField label="显示排序" name="sort">
                                    <UInput v-model.number="state.sort" type="number" placeholder="0" class="w-full" />
                                </UFormField>

                                <UFormField label="菜单状态" name="status">
                                    <USelectMenu v-model="state.status" :items="statusOptions" value-key="value"
                                        class="w-full" />
                                </UFormField>

                                <UFormField label="是否显示" name="visible">
                                    <USelectMenu v-model="state.visible" :items="visibleOptions" value-key="value"
                                        class="w-full" />
                                </UFormField>
                            </div>

                            <UFormField label="备注" name="remark">
                                <UTextarea v-model="state.remark" placeholder="添加备注信息" :rows="4" class="w-full" />
                            </UFormField>
                        </div>
                    </template>
                </UTabs>
            </UForm>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2">
                <UButton label="取消" color="gray" variant="ghost" @click="closeDialog" />
                <UButton label="重置" color="gray" variant="outline" @click="handleReset" />
                <UButton label="保存" color="primary" :loading="loading" @click="onSubmit" />
            </div>
        </template>
    </USlideover>

    <!-- 批量添加按钮弹窗 -->
    <ButtonSelector v-model:visible="batchButtonVisible" title="批量添加按钮" @confirm="confirmBatchAddButtons" />

    <!-- 自定义按钮对话框 -->
    <UModal v-model:open="customButtonVisible" :title="editingButtonIndex >= 0 ? '编辑按钮' : '添加自定义按钮'">
        <template #body>
            <UForm ref="buttonFormRef" :schema="buttonFormSchema" :state="customButtonForm" class="space-y-4"
                @submit="confirmCustomButton">
                <UFormField label="按钮名称" name="name" required>
                    <UInput v-model="customButtonForm.name" placeholder="新增" class="w-full" />
                </UFormField>

                <UFormField label="权限标识" name="permission" required description="格式：模块:功能:操作">
                    <UInput v-model="customButtonForm.permission" placeholder="system:user:add" class="w-full" />
                </UFormField>

                <UFormField label="按钮图标" name="icon">
                    <IconSelector v-model="customButtonForm.icon" class="w-full" />
                </UFormField>

                <UFormField label="排序值" name="sort">
                    <UInput v-model.number="customButtonForm.sort" type="number" placeholder="0" class="w-full" />
                </UFormField>
            </UForm>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2">
                <UButton label="取消" color="gray" variant="ghost" @click="cancelCustomButton" />
                <UButton :label="editingButtonIndex >= 0 ? '保存' : '添加'" color="primary" @click="confirmCustomButton" />
            </div>
        </template>
    </UModal>
</template>
