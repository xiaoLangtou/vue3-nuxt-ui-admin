<script setup lang="ts">
import { IconSelector, TreeSelect } from '@/components';
import type { MenuFormData, MenuTreeNode } from '@/types/menu';
import { MENU_TYPE_DICT } from '@/global/constants';
import { z } from 'zod';
import ButtonSelector from './ButtonSelector.vue';

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

// 常量配置
const MENU_TYPE = {
    DIRECTORY: 0,
    MENU: 1
} as const;

const YES_NO_OPTIONS = [
    { label: '是', value: '1' },
    { label: '否', value: '0' }
] as const;

const STATUS_OPTIONS = [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 }
] as const;

const MENU_TYPE_OPTIONS = [
    { label: MENU_TYPE_DICT['0'], value: MENU_TYPE.DIRECTORY, icon: 'i-lucide-folder' },
    { label: MENU_TYPE_DICT['1'], value: MENU_TYPE.MENU, icon: 'i-lucide-file' }
] as const;

const TABS_CONFIG = [
    { key: 'basic', label: '路由配置', icon: 'i-lucide-route', slot: 'basic' },
    { key: 'buttons', label: '按钮权限', icon: 'i-lucide-mouse-pointer-click', slot: 'buttons' }
] as const;

// Zod 验证模式
const menuFormSchema = z.object({
    type: z.union([z.literal(MENU_TYPE.DIRECTORY), z.literal(MENU_TYPE.MENU)]).refine(
        (val) => [MENU_TYPE.DIRECTORY, MENU_TYPE.MENU].includes(val),
        { message: '请选择菜单类型' }
    ),
    parentId: z.union([z.string(), z.number()]).optional(),
    name: z.string().min(1, '请输入菜单名称'),
    path: z.string().optional(),
    component: z.string().optional(),
    enName: z.string().optional(),
    permission: z.string().optional(),
    icon: z.string().optional(),
    sort: z.number().min(0).max(9999).default(999),
    isKeepAlive: z.string().optional(),
    isHide: z.string().optional(),
    isIframe: z.string().optional(),
    isEmbedded: z.string().optional(),
    iframeUrl: z.string().optional(),
    isLink: z.string().optional(),
    status: z.number().default(1),
    remark: z.string().optional(),
    buttons: z.array(
        z.object({
            name: z.string(),
            permission: z.string()
        })
    ).optional().default([])
});

const buttonFormSchema = z.object({
    name: z.string().min(1, '请输入按钮名称'),
    permission: z.string().min(1, '请输入权限标识'),
    icon: z.string().optional(),
    sort: z.number().default(0)
});

// 计算属性
const dialogVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value)
});

const isMenuType = computed(() => state.value.type === MENU_TYPE.MENU);
const isDirectoryType = computed(() => state.value.type === MENU_TYPE.DIRECTORY);
const buttonsCount = computed(() => state.value.buttons?.length || 0);

// 初始化表单数据
const initFormData = (data?: MenuFormData) => ({
    type: data?.type ?? MENU_TYPE.MENU,
    parentId: data?.parentId ?? undefined,
    name: data?.name || '',
    path: data?.path || '',
    component: data?.component || '',
    enName: data?.enName || '',
    permission: data?.permission || '',
    icon: data?.icon || '',
    sort: data?.sort || 999,
    isKeepAlive: data?.isKeepAlive || '0',
    isHide: data?.isHide || '0',
    isIframe: data?.isIframe || '0',
    isEmbedded: data?.isEmbedded || '0',
    iframeUrl: data?.iframeUrl || '',
    isLink: data?.isLink || '0',
    status: data?.status ?? 1,
    remark: data?.remark || '',
    buttons: data?.buttons || []
});

const state = ref(initFormData(props.formData));

// 监听表单数据变化
watch(
    () => props.formData,
    (newData) => {
        if (newData) {
            state.value = initFormData(newData);
        }
    },
    { deep: true, immediate: true }
);

// 自动设置 parentId
watch(
    [() => state.value.type, () => state.value.parentId],
    ([newType, newParentId]) => {
        // 菜单类型为MENU且上级菜单为空时，设置parentId为0
        if (newType === MENU_TYPE.MENU && (newParentId === undefined || newParentId === null || newParentId === '')) {
            state.value.parentId = 0;
        }
    },
    { immediate: true }
);

// Refs
const formRef = ref();
const buttonFormRef = ref();

// 表单操作
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

// 按钮管理
const batchButtonVisible = ref(false);
const customButtonVisible = ref(false);
const editingButtonIndex = ref(-1);
const customButtonForm = ref({
    name: '',
    permission: '',
    icon: 'i-lucide-circle',
    sort: 0
});

const generateId = () => Date.now() + Math.random();

const openBatchButtonDialog = () => {
    batchButtonVisible.value = true;
};

const confirmBatchAddButtons = (buttonsToAdd: any[]) => {
    if (!state.value.buttons) {
        state.value.buttons = [];
    }

    const newButtons = buttonsToAdd.map(button => ({
        id: generateId(),
        name: button.name,
        permission: button.permission,
        icon: button.icon,
        sort: button.sort
    }));

    state.value.buttons.push(...newButtons);
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
                <UTabs :items="TABS_CONFIG" class="w-full">
                    <!-- 基础信息 -->
                    <template #basic>
                        <div class="p-6">
                            <div class="grid grid-cols-2 gap-4">
                                <UFormField label="菜单类型" name="type" required>
                                    <USelectMenu v-model="state.type" :items="MENU_TYPE_OPTIONS" value-key="value"
                                        label-key="label" placeholder="选择类型" class="w-full">
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

                                <UFormField v-if="!isDirectoryType" name="path">
                                    <template #label>
                                        <div class="flex items-center gap-1">
                                            <span>路由地址</span>
                                            <UTooltip text="访问地址。一级菜单需以 / 开头（如 /dashboard），子菜单填相对路径（如 user）" :popper="{ placement: 'top' }" :delay-duration="0">
                                                <UIcon name="i-lucide-help-circle" class="w-4 h-4 text-gray-400 cursor-help" />
                                            </UTooltip>
                                        </div>
                                    </template>
                                    <UInput v-model="state.path" placeholder="请输入路由地址" class="w-full" />
                                </UFormField>

                                <UFormField v-if="isMenuType" name="component">
                                    <template #label>
                                        <div class="flex items-center gap-1">
                                            <span>组件路径</span>
                                            <UTooltip text="Vue组件路径。顶级菜单填 /index/index，常规页面填如 /system/user/index" :popper="{ placement: 'top' }" :delay-duration="0">
                                                <UIcon name="i-lucide-help-circle" class="w-4 h-4 text-gray-400 cursor-help" />
                                            </UTooltip>
                                        </div>
                                    </template>
                                    <UInput v-model="state.component" placeholder="请输入组件路径" class="w-full" />
                                </UFormField>

                                <UFormField v-if="isMenuType" name="enName">
                                    <template #label>
                                        <div class="flex items-center gap-1">
                                            <span>组件名称</span>
                                            <UTooltip text="组件英文名称，用于 KeepAlive 缓存，必须与组件内部 name 保持一致" :popper="{ placement: 'top' }" :delay-duration="0">
                                                <UIcon name="i-lucide-help-circle" class="w-4 h-4 text-gray-400 cursor-help" />
                                            </UTooltip>
                                        </div>
                                    </template>
                                    <UInput v-model="state.enName" placeholder="请输入组件英文名称" class="w-full" />
                                </UFormField>

                                <UFormField v-if="isMenuType" name="permission">
                                    <template #label>
                                        <div class="flex items-center gap-1">
                                            <span>角色权限</span>
                                            <UTooltip text="控制器中定义的权限字符，如 system:user:list" :popper="{ placement: 'top' }">
                                                <UIcon name="i-lucide-help-circle" class="w-4 h-4 text-gray-400 cursor-help" />
                                            </UTooltip>
                                        </div>
                                    </template>
                                    <UInput v-model="state.permission" placeholder="请输入角色权限标识" class="w-full" />
                                </UFormField>

                                <UFormField v-if="!isDirectoryType" label="图标" name="icon">
                                    <IconSelector v-model="state.icon" placeholder="选择图标" class="w-full" />
                                </UFormField>

                                <UFormField label="菜单排序" name="sort">
                                    <UInput v-model.number="state.sort" type="number" placeholder="0" class="w-full" />
                                </UFormField>

                                <template v-if="!isDirectoryType">
                                    <UFormField label="是否外链" name="isIframe">
                                        <USelectMenu v-model="state.isIframe" :items="YES_NO_OPTIONS" value-key="value" label-key="label" class="w-full" />
                                    </UFormField>

                                    <UFormField v-if="state.isIframe === '1'" label="外链地址" name="iframeUrl">
                                        <UInput v-model="state.iframeUrl" placeholder="请输入外链地址 (http://...)" class="w-full" />
                                    </UFormField>

                                    <UFormField label="是否启用" name="status">
                                        <USelectMenu v-model="state.status" :items="STATUS_OPTIONS" value-key="value" label-key="label" class="w-full" />
                                    </UFormField>

                                    <UFormField label="页面缓存" name="isKeepAlive">
                                        <USelectMenu v-model="state.isKeepAlive" :items="YES_NO_OPTIONS" value-key="value" label-key="label" class="w-full" />
                                    </UFormField>

                                    <UFormField label="隐藏菜单" name="isHide">
                                        <USelectMenu v-model="state.isHide" :items="YES_NO_OPTIONS" value-key="value" label-key="label" class="w-full" />
                                    </UFormField>

                                    <UFormField label="是否内嵌" name="isEmbedded">
                                        <USelectMenu v-model="state.isEmbedded" :items="YES_NO_OPTIONS" value-key="value" label-key="label" class="w-full" />
                                    </UFormField>
                                </template>
                            </div>
                        </div>
                    </template>

                    <!-- 按钮权限 -->
                    <template #buttons>
                        <div class="p-6 space-y-4">
                            <!-- 目录类型禁用提示 -->
                            <UAlert v-if="isDirectoryType" icon="i-lucide-info" color="primary"
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

                            <template v-if="!isDirectoryType">
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
