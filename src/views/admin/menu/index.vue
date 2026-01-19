<script setup lang="ts">
import { ListSearch, PageContainer } from '@/components';
import type { FilterConfig, SearchParams } from '@/types/search';
import type { TableColumn } from '@nuxt/ui';
import { computed, h, onMounted, ref, resolveComponent } from 'vue';
import MenuForm from './components/menu-form.vue';
import { useMenuManagement } from './composables/useMenuManagement';
import { menuApi } from '@/services/modules/menu';
import { useLucideIcon } from '@/composables/useLucideIcon';
import { MENU_TYPE_DICT } from '@/global/constants';

const UIcon = resolveComponent('UIcon');
const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');

// 使用 Lucide 图标 composable
const { isLucideIcon, lucideIconName } = useLucideIcon();

// 使用菜单管理组合函数
const {
    loading,
    menuList,
    selectedMenus,
    expandedKeys,
    dialogVisible,
    dialogTitle,
    formData,
    queryParams,
    fetchMenuList,
    searchMenus,
    openCreateDialog,
    openEditDialog,
    saveMenu,
    deleteMenu,
    batchDeleteMenus,
    exportMenus,
    refreshMenus,
    getMenuTreeOptions,
    resetForm,
    toast
} = useMenuManagement();

// 搜索参数
const searchParams = ref<SearchParams>({
    keyword: '',
    filters: {}
});

// 搜索配置
const filterConfigs: FilterConfig[] = [
    {
        key: 'name',
        label: '菜单名称',
        type: 'input',
        placeholder: '请输入菜单名称'
    },
    {
        key: 'type',
        label: '菜单类型',
        type: 'select',
        options: [
            { label: '全部', value: '' },
            { label: '目录', value: 'directory' },
            { label: '菜单', value: 'menu' },
            { label: '按钮', value: 'button' }
        ]
    },
    {
        key: 'status',
        label: '状态',
        type: 'select',
        options: [
            { label: '全部', value: '' },
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 }
        ]
    },
    {
        key: 'visible',
        label: '是否显示',
        type: 'select',
        options: [
            { label: '全部', value: '' },
            { label: '显示', value: true },
            { label: '隐藏', value: false }
        ]
    }
];

// 表格列定义
const columns: TableColumn<any>[] = [
    {
        accessorKey: 'name',
        header: '菜单名称',
        meta: { class: { th: 'min-w-[200px]' } },
        cell: ({ row }) => {
            return h(
                'div',
                {
                    style: { paddingLeft: `${row.depth * 1.5}rem` },
                    class: 'flex items-center gap-2'
                },
                [
                    h(UButton, {
                        color: 'neutral',
                        variant: 'ghost',
                        size: 'xs',
                        icon: row.getIsExpanded() ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right',
                        class: !row.getCanExpand() && 'invisible',
                        ui: { base: 'p-0', leadingIcon: 'size-4' },
                        onClick: row.getToggleExpandedHandler()
                    }),
                    row.original.icon
                        ? h(
                            'div',
                            { class: 'shrink-0 w-5 h-5 rounded bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center' },
                            [
                                isLucideIcon(row.original.icon)
                                    ? h(lucideIconName(row.original.icon), { class: 'w-3.5 h-3.5 text-primary-500', strokeWidth: 2 })
                                    : h(UIcon, { name: row.original.icon, class: 'w-3.5 h-3.5 text-primary-500' })
                            ]
                        )
                        : null,
                    h('span', { class: 'font-medium text-gray-900 dark:text-white truncate' }, row.getValue('name'))
                ]
            );
        }
    },
    {
        accessorKey: 'type',
        header: '类型',
        meta: { class: { th: 'w-28 text-center', td: 'text-center' } },
        cell: ({ row }) => {
            const type = String(row.original.menuType);
            const label = MENU_TYPE_DICT[type] || type;
            return h('span', { class: 'text-sm text-gray-700 dark:text-gray-300' }, label);
        }
    },
    {
        accessorKey: 'path',
        header: '路由路径',
        meta: { class: { th: 'min-w-[180px]' } },
        cell: ({ row }) => {
            if (row.original.isExternal && row.original.externalUrl) {
                return h(
                    'a',
                    {
                        href: row.original.externalUrl,
                        target: '_blank',
                        class: 'text-primary-500 hover:underline flex items-center gap-1 font-mono text-xs'
                    },
                    [row.original.externalUrl, h(UIcon, { name: 'i-lucide-external-link', class: 'w-3 h-3' })]
                );
            }
            if (row.getValue('path')) {
                return h(UBadge, { label: row.getValue('path'), color: 'gray', variant: 'soft', class: 'font-mono text-xs' });
            }
            return h('span', { class: 'text-gray-400' }, '-');
        }
    },
    {
        accessorKey: 'permission',
        header: '权限标识',
        meta: { class: { th: 'min-w-[150px]' } },
        cell: ({ row }) => {
            const permission = row.getValue('permission');
            return permission
                ? h('code', { class: 'text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded' }, permission)
                : h('span', { class: 'text-gray-400' }, '-');
        }
    },
    {
        accessorKey: 'sort',
        header: '排序',
        meta: { class: { th: 'w-20 text-center', td: 'text-center' } },
        cell: ({ row }) => h(UBadge, { label: String(row.getValue('sort') || 0), color: 'neutral', variant: 'subtle' })
    },
    {
        accessorKey: 'status',
        header: '状态',
        meta: { class: { th: 'w-24 text-center', td: 'text-center' } },
        cell: ({ row }) => {
            const status = row.getValue('status');
            return h(UBadge, {
                label: status === 1 ? '启用' : '禁用',
                color: status === 1 ? 'success' : 'error',
                variant: 'subtle'
            });
        }
    },
    {
        accessorKey: 'visible',
        header: '显示',
        meta: { class: { th: 'w-20 text-center', td: 'text-center' } },
        cell: ({ row }) => {
            const visible = row.getValue('visible');
            return h(UIcon, {
                name: visible ? 'i-lucide-eye' : 'i-lucide-eye-off',
                class: visible ? 'w-4 h-4 text-primary-500' : 'w-4 h-4 text-gray-400'
            });
        }
    },
    {
        accessorKey: 'createTime',
        header: '创建时间',
        meta: { class: { th: 'w-40' } },
        cell: ({ row }) => {
            const time = row.getValue('createTime');
            return h('span', { class: 'text-sm text-gray-500 dark:text-gray-400' }, time || '-');
        }
    },
    { id: 'actions', header: '操作', meta: { class: { th: 'w-40 text-right', td: 'text-right' } } }
];

// 展开状态（使用索引作为 key）
const expanded = ref<Record<number, boolean>>({});


// 父级菜单选项
const parentMenuOptions = computed(() => {
    return getMenuTreeOptions(formData.id);
});

// 确认删除相关
const deleteModalVisible = ref(false);
const deleteTarget = ref<any>(null);
const isBatchDelete = ref(false);

const openDeleteConfirm = (row: any) => {
    deleteTarget.value = row;
    isBatchDelete.value = false;
    deleteModalVisible.value = true;
};

const openBatchDeleteConfirm = () => {
    if (selectedMenus.value.length === 0) return;
    isBatchDelete.value = true;
    deleteModalVisible.value = true;
};

const confirmDelete = async () => {
    if (isBatchDelete.value) {
        await batchDeleteMenus();
    } else if (deleteTarget.value) {
        await deleteMenu(deleteTarget.value);
    }
    deleteModalVisible.value = false;
    deleteTarget.value = null;
};

/**
 * 处理搜索
 */
const handleSearch = (params: SearchParams) => {
    searchParams.value = params;
    // 直接使用 filters 中的值，避免嵌套
    const filters = params.filters || {};
    queryParams.name = filters.name || '';
    queryParams.type = filters.type || undefined;
    queryParams.status = filters.status !== undefined ? filters.status : undefined;
    queryParams.visible = filters.visible !== undefined ? filters.visible : undefined;
    fetchMenuList();
};

/**
 * 处理新增菜单
 */
const handleCreate = () => {
    openCreateDialog();
};

/**
 * 处理添加子菜单
 */
const handleAddChild = (parentId: string) => {
    openCreateDialog(parentId);
};

/**
 * 处理编辑菜单
 */
const handleEdit = (menuId: string) => {
    const findMenu = (menus: any[], id: string): any => {
        for (const menu of menus) {
            if (menu.id === id) return menu;
            if (menu.children) {
                const found = findMenu(menu.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const menu = findMenu(menuList.value, menuId);
    if (menu) {
        openEditDialog(menu);
    }
};

/**
 * 处理表单提交
 */
const handleFormSubmit = (data: any) => {
    Object.assign(formData, data);
    saveMenu();
};

/**
 * 处理表单关闭
 */
const handleFormClose = () => {
    resetForm();
};

/**
 * 处理批量添加按钮
 */
const handleBatchAddButtons = async (buttons: any[]) => {
    try {
        loading.value = true;

        // 确保有选中的菜单或当前编辑的菜单
        const menuId = formData.id || formData.parentId;
        if (!menuId) {
            toast.add({
                color: 'orange',
                title: '警告',
                description: '请先选择要添加按钮的菜单'
            });
            return;
        }

        // 调用批量创建按钮API
        await menuApi.batchCreateButtons(menuId, buttons);

        // 刷新菜单列表
        await fetchMenuList();

        // 显示成功消息
        toast.add({
            color: 'success',
            title: '成功',
            description: `成功添加 ${buttons.length} 个按钮`
        });
    } catch (error) {
        console.error('批量添加按钮失败:', error);
        toast.add({
            color: 'red',
            title: '错误',
            description: '批量添加按钮失败，请检查网络连接或稍后重试'
        });
    } finally {
        loading.value = false;
    }
};

// 组件挂载时获取数据
onMounted(() => {
    fetchMenuList();
});
</script>

<template>
    <div class="h-full flex flex-col gap-4">
        <!-- 搜索区域 -->
        <ListSearch v-model="searchParams" :filter-configs="filterConfigs" placeholder="搜索菜单名称、路径..." :loading="loading"
            @search="handleSearch">
            <template #actions>
                <UButton icon="i-lucide-plus" color="primary" @click="handleCreate">
                    新增菜单
                </UButton>
                <UButton icon="i-lucide-trash-2" color="error" variant="soft" :disabled="selectedMenus.length === 0"
                    @click="openBatchDeleteConfirm">
                    批量删除
                </UButton>
                <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" :loading="loading"
                    @click="refreshMenus">
                    刷新
                </UButton>
            </template>
        </ListSearch>

        <!-- 表格区域 -->
        <div
            class="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
            <div class="flex-1 overflow-auto">
                <UTable v-model="selectedMenus" v-model:expanded="expanded" :data="menuList" :columns="columns"
                    :loading="loading" :get-sub-rows="(row) => row.children" :ui="{
                        base: 'border-separate border-spacing-0',
                        th: { base: 'bg-gray-50 dark:bg-gray-800/50' },
                        divide: 'divide-gray-100 dark:divide-gray-800',
                        tbody: '[&>tr]:last:[&>td]:border-b-0',
                        tr: 'group',
                        td: 'empty:p-0 group-has-[td:not(:empty)]:border-b border-gray-100 dark:border-gray-800'
                    }">
                    <!-- 操作列 -->
                    <template #actions-cell="{ row }">
                        <div class="flex items-center justify-end gap-1">
                            <UButton icon="i-lucide-plus" color="primary" variant="ghost"
                                @click="handleAddChild(row.id)">
                                添加子菜单
                            </UButton>
                            <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" @click="handleEdit(row.id)">
                                编辑
                            </UButton>
                            <UButton icon="i-lucide-trash-2" color="error" variant="ghost"
                                @click="openDeleteConfirm(row)">
                                删除
                            </UButton>
                        </div>
                    </template>

                    <!-- 空状态 -->
                    <template #empty>
                        <div class="flex flex-col items-center justify-center py-16 gap-3">
                            <div class="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                                <UIcon name="i-lucide-folder-tree" class="w-8 h-8 text-gray-400" />
                            </div>
                            <div class="text-center">
                                <p class="text-sm font-medium text-gray-900 dark:text-white">暂无菜单数据</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">点击下方按钮创建第一个菜单</p>
                            </div>
                            <UButton label="新增菜单" icon="i-lucide-plus" color="primary" @click="handleCreate" />
                        </div>
                    </template>
                </UTable>
            </div>
        </div>

        <!-- 菜单表单弹窗 -->
        <MenuForm v-model:visible="dialogVisible" v-model:form-data="formData" :title="dialogTitle"
            :parent-menu-options="parentMenuOptions" :loading="loading" @submit="handleFormSubmit"
            @close="handleFormClose" @batch-add-buttons="handleBatchAddButtons" />

        <!-- 删除确认弹窗 -->
        <UModal v-model:open="deleteModalVisible" :ui="{ content: 'max-w-md' }">
            <template #body>
                <div class="space-y-4">
                    <div class="flex items-start gap-3">
                        <div class="shrink-0 p-2 rounded-full bg-error-50 dark:bg-error-900/20">
                            <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-error-500" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                                确认删除
                            </h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {{ isBatchDelete ? `确定要删除选中的 ${selectedMenus.length} 个菜单吗？` : `确定要删除菜单
                                "${deleteTarget?.name}" 吗？` }}
                            </p>
                        </div>
                    </div>

                    <UAlert color="error" variant="subtle" icon="i-lucide-info" title="警告"
                        description="此操作无法撤销，删除后数据将永久丢失，请谨慎操作。" />
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton label="取消" color="neutral" variant="ghost" @click="deleteModalVisible = false" />
                    <UButton label="确认删除" color="error" icon="i-lucide-trash-2" @click="confirmDelete" />
                </div>
            </template>
        </UModal>

        <!-- 菜单表单弹窗 -->
        <MenuForm v-model:visible="dialogVisible" v-model:form-data="formData" :title="dialogTitle"
            :parent-menu-options="parentMenuOptions" :loading="loading" @submit="handleFormSubmit"
            @close="handleFormClose" @batch-add-buttons="handleBatchAddButtons" />
    </div>
</template>
