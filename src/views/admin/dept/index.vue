<script setup lang="tsx">
import { ListSearch } from '@/components/custom-search';
import type { FilterConfig, SearchParams } from '@/types/search';

// Mock Data
const departments = ref([
    { id: 1, name: '研发部', status: 'enabled', createTime: '2023-01-01', leader: '张三', memberCount: 120 },
    { id: 2, name: '市场部', status: 'enabled', createTime: '2023-02-15', leader: '李四', memberCount: 45 },
    { id: 3, name: '人力资源部', status: 'disabled', createTime: '2023-03-10', leader: '王五', memberCount: 12 },
    { id: 4, name: '财务部', status: 'enabled', createTime: '2023-04-01', leader: '赵六', memberCount: 8 },
    { id: 5, name: '运维部', status: 'enabled', createTime: '2023-05-20', leader: '孙七', memberCount: 30 },
]);

const loading = ref(false);
const total = ref(100);

// Search Params
const searchParams = ref<SearchParams>({
    keyword: '',
    filters: {},
    pagination: { page: 1, size: 10 },
    sort: { field: 'createTime', order: 'desc' }
});

// Filter Configuration
const filterConfigs: FilterConfig[] = [
    {
        key: 'status',
        label: '状态',
        type: 'select',
        options: [
            { label: '全部', value: '' },
            { label: '启用', value: 'enabled' },
            { label: '禁用', value: 'disabled' }
        ]
    },
    {
        key: 'createTime',
        label: '创建时间',
        type: 'date'
    },
    {
        key: 'leader',
        label: '负责人',
        type: 'input',
        placeholder: '请输入负责人姓名'
    },
    {
        key: 'type',
        label: '部门类型',
        type: 'multiSelect',
        options: [
            { label: '职能部门', value: 'functional' },
            { label: '业务部门', value: 'business' },
            { label: '项目组', value: 'project' }
        ]
    },
    // Demo: Render Function (JSX)
    {
        key: 'renderDemo',
        label: 'Render Demo',
        type: 'slot',
        render: ({ value, update }) => {
            return (
                <div class="flex gap-2 p-2  ">
                    <button
                        class={`px-3 py-1 rounded text-sm ${value === 'A' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                        onClick={() => update(value === 'A' ? '' : 'A')}
                    >
                        选项A {value === 'A' ? '✓' : ''}
                    </button>
                    <button
                        class={`px-3 py-1 rounded text-sm ${value === 'B' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                        onClick={() => update(value === 'B' ? '' : 'B')}
                    >
                        选项B {value === 'B' ? '✓' : ''}
                    </button>
                </div>
            );
        }
    },
    // Demo: Slot
    {
        key: 'slotDemo',
        label: 'Slot Demo',
        type: 'slot',
        slotName: 'custom-filter-slot'
    }
];

// Table Columns
const columns = [
    { accessorKey: 'name', header: '部门名称' },
    { accessorKey: 'leader', header: '负责人' },
    { accessorKey: 'memberCount', header: '人数' },
    { accessorKey: 'status', header: '状态' },
    { accessorKey: 'createTime', header: '创建时间' },
    { id: 'actions', header: '操作' }
];

// Handlers
const handleSearch = (params: SearchParams) => {
    loading.value = true;
    console.log('Search params triggered:', params);

    // Simulate API delay
    setTimeout(() => {
        loading.value = false;
        // In real app: fetch data using params
    }, 600);
};

const handleReset = () => {
    console.log('Reset triggered');
    // Reset logic if additional cleanup is needed
};

const handleEdit = (row: any) => {
    console.log('Edit row:', row);
};

const handleDelete = (row: any) => {
    console.log('Delete row:', row);
};
</script>

<template>
    <div class="p-4 space-y-4">
        <div class="flex justify-between items-center mb-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">部门管理</h1>
                <p class="text-gray-500 text-sm mt-1">管理公司组织架构及部门信息</p>
            </div>
            <UButton icon="i-lucide-plus" label="新增部门" color="primary" />
        </div>

        <!-- Search Component Demo -->
        <ListSearch
            v-model="searchParams"
            :filter-configs="filterConfigs"
            :loading="loading"
            :total="total"
            placeholder="搜索部门名称/编码..."
            @search="handleSearch"
            @reset="handleReset"
        >
            <!-- Demo: Custom Slot Filter -->
            <template #custom-filter-slot="{ value, update }">
                <div class="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-md p-1">
                    <UButton
                        icon="i-lucide-star"
                        color="yellow"
                        variant="ghost"
                        size="xs"
                        :class="{ 'bg-yellow-100 dark:bg-yellow-900/30': value }"
                        @click="update(!value)"
                    />
                    <span class="text-xs text-gray-500">{{ value ? '已收藏' : '未收藏' }}</span>
                </div>
            </template>

            <template #actions>
                <UButton label="导出" icon="i-lucide-download" color="gray" variant="ghost" />
            </template>
        </ListSearch>

        <!-- Data Table -->
        <UCard :ui="{ body: { padding: 'p-0' } }">
            <UTable
                :rows="departments"
                :columns="columns"
                :loading="loading"
                :ui="{
                    th: { base: 'whitespace-nowrap' },
                    td: { base: 'whitespace-nowrap' }
                }"
            >
                <!-- Custom Status Column -->
                <template #status-cell="{ row }">
                    <UBadge
                        :color="row.original.status === 'enabled' ? 'green' : 'red'"
                        variant="subtle"
                        size="xs"
                    >
                        {{ row.original.status === 'enabled' ? '启用' : '禁用' }}
                    </UBadge>
                </template>

                <!-- Actions Column -->
                <template #actions-cell="{ row }">
                    <div class="flex gap-2">
                        <UButton
                            icon="i-lucide-edit"
                            size="xs"
                            color="blue"
                            variant="ghost"
                            @click="handleEdit(row.original)"
                        />
                        <UButton
                            icon="i-lucide-trash-2"
                            size="xs"
                            color="red"
                            variant="ghost"
                            @click="handleDelete(row.original)"
                        />
                    </div>
                </template>
            </UTable>

            <!-- Pagination -->
            <div class="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div class="text-sm text-gray-500">
                    共 {{ total }} 条记录
                </div>
                <UPagination
                    v-model="searchParams.pagination.page"
                    :total="total"
                    :page-count="searchParams.pagination.size"
                    size="sm"
                />
            </div>
        </UCard>
    </div>
</template>
