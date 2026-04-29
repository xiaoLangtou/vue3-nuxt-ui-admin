<script lang="ts" setup>
import { ListSearch } from '@/components';
import { type MenuTreeNode, MenuType } from '@/types/menu';
import type { FilterConfig, SearchParams } from '@/types/search';
import type { TableColumn } from '@nuxt/ui';
import MenuForm from './components/menu-form.vue';
import { useMenuManagement } from './composables/useMenuManagement';
import { menuApi } from '@/services/modules/menu';
import { useLucideIcon } from '@/composables/useLucideIcon';
import { MENU_TYPE_DICT } from '@/global/constants';

// 使用 Lucide 图标 composable
const {isLucideIcon, lucideIconName} = useLucideIcon();

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


const {tableUi} = useTableSetting();

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
            {label: '全部', value: ''},
            {label: '目录', value: 'directory'},
            {label: '菜单', value: 'menu'},
            {label: '按钮', value: 'button'}
        ]
    },
    {
        key: 'status',
        label: '状态',
        type: 'select',
        options: [
            {label: '全部', value: ''},
            {label: '启用', value: 1},
            {label: '禁用', value: 0}
        ]
    },
    {
        key: 'visible',
        label: '是否显示',
        type: 'select',
        options: [
            {label: '全部', value: ''},
            {label: '显示', value: true},
            {label: '隐藏', value: false}
        ]
    }
];

// 表格列定义
const columns: TableColumn<any>[] = [
    {
        accessorKey: 'name',
        header: '菜单名称',
        meta: {class: {th: 'min-w-[200px]'}}
    },
    {
        accessorKey: 'type',
        header: '类型',
        meta: {class: {th: 'w-28 text-center', td: 'text-center'}}
    },
    {
        accessorKey: 'path',
        header: '路由路径',
        meta: {class: {th: 'min-w-[180px]'}}
    },
    {
        accessorKey: 'permission',
        header: '权限标识',
        meta: {class: {th: 'min-w-[150px]'}}
    },
    {
        accessorKey: 'sort',
        header: '排序',
        meta: {class: {th: 'w-20 text-center', td: 'text-center'}}
    },
    {
        accessorKey: 'status',
        header: '状态',
        meta: {class: {th: 'w-24 text-center', td: 'text-center'}}
    },
    {
        accessorKey: 'visible',
        header: '显示',
        meta: {class: {th: 'w-20 text-center', td: 'text-center'}}
    },
    {
        accessorKey: 'createTime',
        header: '创建时间',
        meta: {class: {th: 'w-40'}}
    },
    {
        id: 'actions',
        header: '操作',
        meta: {class: {th: 'w-40 text-right', td: 'text-right'}}
    }
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
    if ( selectedMenus.value.length === 0 ) return;
    isBatchDelete.value = true;
    deleteModalVisible.value = true;
};

const confirmDelete = async () => {
    if ( isBatchDelete.value ) {
        await batchDeleteMenus();
    } else if ( deleteTarget.value ) {
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
        for ( const menu of menus ) {
            if ( menu.id === id ) return menu;
            if ( menu.children ) {
                const found = findMenu(menu.children, id);
                if ( found ) return found;
            }
        }
        return null;
    };

    const menu = findMenu(menuList.value, menuId);
    if ( menu ) {
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
        if ( !menuId ) {
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
            description: `成功添加 ${ buttons.length } 个按钮`
        });
    } catch ( error ) {
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
        <ListSearch v-model="searchParams" :filter-configs="filterConfigs" :loading="loading"
                    placeholder="搜索菜单名称、路径..."
                    @search="handleSearch">
            <template #actions>
                <UButton color="primary" icon="i-lucide-plus" @click="handleCreate">
                    新增菜单
                </UButton>
                <UButton :disabled="selectedMenus.length === 0" color="error" icon="i-lucide-trash-2" variant="soft"
                         @click="openBatchDeleteConfirm">
                    批量删除
                </UButton>
                <UButton :loading="loading" color="neutral" icon="i-lucide-refresh-cw" variant="ghost"
                         @click="refreshMenus">
                    刷新
                </UButton>
            </template>
        </ListSearch>

        <!-- 表格区域 -->
        <div
            class="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
            <div class="flex-1 overflow-auto">
                <UTable v-model="selectedMenus" v-model:expanded="expanded" :columns="columns" :data="menuList"
                        :get-sub-rows="(row: MenuTreeNode) => row.children" :loading="loading" :ui="{base: 'border-separate border-spacing-0',
      tbody: '[&>tr]:last:[&>td]:border-b-0',
      tr: 'group',
      td: 'empty:p-0 group-has-[td:not(:empty)]:border-b border-default'}">
                    <!-- 菜单名称列 -->
                    <template #name-cell="{ row }">
                        <div :style="{ paddingLeft: `${row.depth * 1.5}rem` }" class="flex items-center gap-2">
                            <UButton :class="!row.getCanExpand() && 'invisible'"
                                     :icon="row.getIsExpanded() ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                                     :ui="{ base: 'p-0', leadingIcon: 'size-4' }"
                                     color="neutral"
                                     size="xs"
                                     variant="ghost"
                                     @click="row.getToggleExpandedHandler()()"/>
                            <div v-if="row.original.icon"
                                 class="shrink-0 w-5 h-5 rounded bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                                <component :is="lucideIconName(row.original.icon)"
                                           v-if="isLucideIcon(row.original.icon)" :stroke-width="2"
                                           class="w-3.5 h-3.5 text-primary-500"/>
                                <UIcon v-else :name="row.original.icon" class="w-3.5 h-3.5 text-primary-500"/>
                            </div>
                            <span class="font-medium text-gray-900 dark:text-white truncate">{{
                                    row.getValue('name')
                                }}</span>
                        </div>
                    </template>

                    <!-- 类型列 -->
                    <template #type-cell="{ row }">
                        <UBadge>
                            {{ MENU_TYPE_DICT[String(row.original.menuType)] || row.original.menuType }}
                        </UBadge>
                    </template>

                    <!-- 路由路径列 -->
                    <template #path-cell="{ row }">
                        <span v-if="row.getValue('path')" class="text-gray-900 dark:text-white truncate">
                            {{ row.getValue('path') }}
                        </span>
                        <span v-else class="text-gray-400">-</span>
                    </template>

                    <!-- 权限标识列 -->
                    <template #permission-cell="{ row }">
                        <code v-if="row.getValue('permission')"
                              class="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {{ row.getValue('permission') }}
                        </code>
                        <span v-else class="text-gray-400">-</span>
                    </template>


                    <!-- 状态列 -->
                    <template #status-cell="{ row }">
                        <UBadge :color="row.getValue('status') === 1 ? 'success' : 'error'"
                                :label="row.getValue('status') === 1 ? '启用' : '禁用'" variant="subtle"/>
                    </template>

                    <!-- 显示列 -->
                    <template #visible-cell="{ row }">
                        <UIcon :class="row.getValue('visible') ? 'w-4 h-4 text-primary-500' : 'w-4 h-4 text-gray-400'"
                               :name="row.getValue('visible') ? 'i-lucide-eye' : 'i-lucide-eye-off'"/>
                    </template>

                    <!-- 创建时间列 -->
                    <template #createTime-cell="{ row }">
                        <span class="text-sm text-gray-500 dark:text-gray-400">
                            {{ row.getValue('createTime') || '-' }}
                        </span>
                    </template>

                    <!-- 操作列 -->
                    <template #actions-cell="{ row }">
                        <div v-if="row.original.menuType !== MenuType.BUTTON"
                             class="flex items-center justify-end gap-1">
                            <UButton color="primary" icon="i-lucide-plus" variant="ghost"
                                     @click="handleAddChild(row.id)">
                                添加子菜单
                            </UButton>
                            <UButton color="neutral" icon="i-lucide-pencil" variant="ghost" @click="handleEdit(row.id)">
                                编辑
                            </UButton>
                            <UButton color="error" icon="i-lucide-trash-2" variant="ghost"
                                     @click="openDeleteConfirm(row)">
                                删除
                            </UButton>
                        </div>
                    </template>

                    <!-- 空状态 -->
                    <template #empty>
                        <div class="flex flex-col items-center justify-center py-16 gap-3">
                            <div class="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                                <UIcon class="w-8 h-8 text-gray-400" name="i-lucide-folder-tree"/>
                            </div>
                            <div class="text-center">
                                <p class="text-sm font-medium text-gray-900 dark:text-white">暂无菜单数据</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">点击下方按钮创建第一个菜单</p>
                            </div>
                            <UButton color="primary" icon="i-lucide-plus" label="新增菜单" @click="handleCreate"/>
                        </div>
                    </template>
                </UTable>
            </div>
        </div>

        <!-- 菜单表单弹窗 -->
        <MenuForm v-model:form-data="formData" v-model:visible="dialogVisible" :loading="loading"
                  :parent-menu-options="parentMenuOptions" :title="dialogTitle" @close="handleFormClose"
                  @submit="handleFormSubmit" @batch-add-buttons="handleBatchAddButtons"/>

        <!-- 删除确认弹窗 -->
        <UModal v-model:open="deleteModalVisible" :ui="{ content: 'max-w-md' }">
            <template #body>
                <div class="space-y-4">
                    <div class="flex items-start gap-3">
                        <div class="shrink-0 p-2 rounded-full bg-error-50 dark:bg-error-900/20">
                            <UIcon class="w-5 h-5 text-error-500" name="i-lucide-alert-triangle"/>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                                确认删除
                            </h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {{
                                    isBatchDelete ? `确定要删除选中的 ${ selectedMenus.length } 个菜单吗？` : `确定要删除菜单
                                "${ deleteTarget?.name }" 吗？`
                                }}
                            </p>
                        </div>
                    </div>

                    <UAlert color="error" description="此操作无法撤销，删除后数据将永久丢失，请谨慎操作。"
                            icon="i-lucide-info" title="警告"
                            variant="subtle"/>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton color="neutral" label="取消" variant="ghost" @click="deleteModalVisible = false"/>
                    <UButton color="error" icon="i-lucide-trash-2" label="确认删除" @click="confirmDelete"/>
                </div>
            </template>
        </UModal>
    </div>
</template>
