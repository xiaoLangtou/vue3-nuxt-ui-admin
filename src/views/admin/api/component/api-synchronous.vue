<script setup lang="ts">
import { HTTP_METHOD, HttpMethodCN } from '@/global/enums';
import type { IApi } from '@/services/types/api';
import { useAddApiMutation, useBatchCreateApiMutation, useIgnoreApiMutation, useSyncApiQuery } from '@/services/composables/useApiQuery';

const emit = defineEmits<{
    close: [];
}>();

const toast = useToast();
const visible = ref(false);
const enabled = ref(false);

const { data: apiRoutes, refetch } = useSyncApiQuery({ enabled });

const addApiMutation = useAddApiMutation();
const ignoreApiMutation = useIgnoreApiMutation();
const batchCreateApiMutation = useBatchCreateApiMutation();

const newApiColumns = [
    { accessorKey: 'path', header: 'API路径' },
    { accessorKey: 'apiGroup', header: 'API分组' },
    { accessorKey: 'description', header: 'API简介' },
    { accessorKey: 'method', header: '请求方式' },
    { id: 'actions', header: '操作', meta: { class: { th: 'w-[200px] text-center', td: 'w-[200px] text-center' } } },
];

const deleteApiColumns = [
    { accessorKey: 'path', header: 'API路径' },
    { accessorKey: 'apiGroup', header: 'API分组' },
    { accessorKey: 'description', header: 'API简介' },
    { accessorKey: 'method', header: '请求方式' },
];

const ignoreApiColumns = [
    { accessorKey: 'path', header: 'API路径' },
    { accessorKey: 'apiGroup', header: 'API分组' },
    { accessorKey: 'description', header: 'API简介' },
    { accessorKey: 'method', header: '请求方式' },
    { id: 'actions', header: '操作', meta: { class: { th: 'w-[150px] text-center', td: 'w-[150px] text-center' } } },
];

const handleAddApi = async (row: IApi) => {
    if (!row.apiGroup || !row.description) {
        toast.add({
            title: '请完善API的分组和简介',
            color: 'warning',
            icon: 'i-lucide-alert-circle',
        });
        return;
    }

    try {
        await addApiMutation.mutateAsync({
            ...row,
            tags: row.apiGroup,
        });
        toast.add({
            title: '新增成功',
            color: 'success',
            icon: 'i-lucide-circle-check',
        });
        await refetch();
    }
    catch (err) {
        toast.add({
            title: '新增失败',
            description: err instanceof Error ? err.message : '未知错误',
            color: 'error',
            icon: 'i-lucide-circle-x',
        });
    }
};

const handleIgnoreApi = async (row: IApi, ignore: number) => {
    try {
        await ignoreApiMutation.mutateAsync({
            ...row,
            ignore,
        });
        toast.add({
            title: ignore === 1 ? '忽略成功' : '取消成功',
            color: 'success',
            icon: 'i-lucide-circle-check',
        });
        await refetch();
    }
    catch (err) {
        toast.add({
            title: ignore === 1 ? '忽略失败' : '取消失败',
            description: err instanceof Error ? err.message : '未知错误',
            color: 'error',
            icon: 'i-lucide-circle-x',
        });
    }
};

const handleSyncAllApi = async () => {
    const newApis = apiRoutes.value?.newApis || [];

    for (const item of newApis) {
        if (!item.apiGroup || !item.description) {
            toast.add({
                title: '请完善API的分组和简介',
                color: 'warning',
                icon: 'i-lucide-alert-circle',
            });
            return;
        }
        item.tags = item.apiGroup;
    }

    try {
        await batchCreateApiMutation.mutateAsync(newApis);
        toast.add({
            title: '同步成功',
            color: 'success',
            icon: 'i-lucide-circle-check',
        });
        await refetch();
    }
    catch (err) {
        toast.add({
            title: '同步失败',
            description: err instanceof Error ? err.message : '未知错误',
            color: 'error',
            icon: 'i-lucide-circle-x',
        });
    }
};

const open = () => {
    visible.value = true;
    enabled.value = true;
    refetch();
};

const handleClose = () => {
    visible.value = false;
    enabled.value = false;
    emit('close');
};

function getMethodColor(method?: HTTP_METHOD): 'primary' | 'success' | 'warning' | 'error' | 'neutral' {
    if (!method) return 'neutral';

    const colorMap: Partial<Record<HTTP_METHOD, 'primary' | 'success' | 'warning' | 'error'>> = {
        [HTTP_METHOD.GET]: 'success',
        [HTTP_METHOD.POST]: 'primary',
        [HTTP_METHOD.PUT]: 'warning',
        [HTTP_METHOD.DELETE]: 'error',
        [HTTP_METHOD.PATCH]: 'warning',
    };

    return colorMap[method] || 'neutral';
}

defineExpose({
    open,
});

defineOptions({
    name: 'ApiSynchronous',
});
</script>

<template>
    <USlideover v-model:open="visible" title="同步接口" :ui="{
        content: 'max-w-[80%]',
        footer: 'flex items-center justify-end gap-3 p-4 sm:px-6'
    }">
        <template #body>
            <div class="space-y-6">
                <UAlert color="warning" variant="subtle" title="提示"
                    description="同步API,不输入路由分组将不会被自动同步,如果api不需要参与鉴权,可以按忽略按钮进行忽略。" />

                <div class="space-y-3">
                    <div class="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <div class="p-1.5 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-500">
                            <UIcon name="i-lucide-plus-circle" class="w-5 h-5" />
                        </div>
                        <div>
                            <h4 class="text-sm font-semibold text-gray-900 dark:text-white">新增路由</h4>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">存在于当前路由中,但是不存在于api表</p>
                        </div>
                    </div>

                    <div class="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
                        <UTable :data="apiRoutes?.newApis || []" :columns="newApiColumns"
                            :ui="{ th: { base: 'bg-gray-50 dark:bg-gray-800/50' }, divide: 'divide-gray-100 dark:divide-gray-800', tbody: { td: { base: 'border-b border-gray-100 dark:border-gray-800' } } }">
                            <template #path-cell="{ row }">
                                <UBadge color="gray" variant="soft" class="font-mono text-xs">{{ row.original.path }}
                                </UBadge>
                            </template>

                            <template #apiGroup-cell="{ row }">
                                <USelect v-model="row.original.apiGroup" :items="apiRoutes?.apiGroups || []"
                                    placeholder="请选择API分组" class="w-full" />
                            </template>

                            <template #description-cell="{ row }">
                                <UInput v-model="row.original.description" placeholder="输入API简介" />
                            </template>

                            <template #method-cell="{ row }">
                                <UBadge v-if="row.original.method"
                                    :label="`${row.original.method}/${HttpMethodCN[row.original.method as HTTP_METHOD] || ''}`"
                                    :color="getMethodColor(row.original.method)" variant="subtle" />
                            </template>

                            <template #actions-cell="{ row }">
                                <div class="flex gap-2 justify-center">
                                    <UTooltip text="新增此条API">
                                        <UButton icon="i-lucide-plus" color="primary" variant="soft"
                                            @click="handleAddApi(row.original)">新增</UButton>
                                    </UTooltip>
                                    <UTooltip text="忽略此条API">
                                        <UButton icon="i-lucide-eye-off" color="gray" variant="soft"
                                            @click="handleIgnoreApi(row.original, 1)">忽略</UButton>
                                    </UTooltip>
                                </div>
                            </template>

                            <template #empty>
                                <div
                                    class="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                                    <UIcon name="i-lucide-inbox" class="w-10 h-10 mb-2 opacity-50" />
                                    <p class="text-sm">暂无新增路由</p>
                                </div>
                            </template>
                        </UTable>
                    </div>
                </div>

                <div class="space-y-3">
                    <div class="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <div class="p-1.5 rounded-md bg-red-50 dark:bg-red-900/20 text-red-500">
                            <UIcon name="i-lucide-trash-2" class="w-5 h-5" />
                        </div>
                        <div>
                            <h4 class="text-sm font-semibold text-gray-900 dark:text-white">删除路由</h4>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">已经不存在于当前项目的路由中,确定同步后会自动从apis表删除
                            </p>
                        </div>
                    </div>

                    <div class="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
                        <UTable :data="apiRoutes?.deleteApis || []" :columns="deleteApiColumns"
                            :ui="{ th: { base: 'bg-gray-50 dark:bg-gray-800/50' }, divide: 'divide-gray-100 dark:divide-gray-800', tbody: { td: { base: 'border-b border-gray-100 dark:border-gray-800' } } }">
                            <template #path-cell="{ row }">
                                <UBadge color="gray" variant="soft" class="font-mono text-xs">{{ row.original.path }}
                                </UBadge>
                            </template>

                            <template #method-cell="{ row }">
                                <UBadge v-if="row.original.method"
                                    :label="`${row.original.method}/${HttpMethodCN[row.original.method as HTTP_METHOD] || ''}`"
                                    :color="getMethodColor(row.original.method)" variant="subtle" />
                            </template>

                            <template #empty>
                                <div
                                    class="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                                    <UIcon name="i-lucide-inbox" class="w-10 h-10 mb-2 opacity-50" />
                                    <p class="text-sm">暂无删除路由</p>
                                </div>
                            </template>
                        </UTable>
                    </div>
                </div>

                <div class="space-y-3">
                    <div class="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <div class="p-1.5 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-500">
                            <UIcon name="i-lucide-eye-off" class="w-5 h-5" />
                        </div>
                        <div>
                            <h4 class="text-sm font-semibold text-gray-900 dark:text-white">忽略路由</h4>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">忽略路由不参与api同步,常见为不需要进行鉴权行为的路由</p>
                        </div>
                    </div>

                    <div class="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
                        <UTable :data="apiRoutes?.ignoreApis || []" :columns="ignoreApiColumns"
                            :ui="{ th: { base: 'bg-gray-50 dark:bg-gray-800/50' }, divide: 'divide-gray-100 dark:divide-gray-800', tbody: { td: { base: 'border-b border-gray-100 dark:border-gray-800' } } }">
                            <template #path-cell="{ row }">
                                <UBadge color="gray" variant="soft" class="font-mono text-xs">{{ row.original.path }}
                                </UBadge>
                            </template>

                            <template #method-cell="{ row }">
                                <UBadge v-if="row.original.method"
                                    :label="`${row.original.method}/${HttpMethodCN[row.original.method as HTTP_METHOD] || ''}`"
                                    :color="getMethodColor(row.original.method)" variant="subtle" />
                            </template>

                            <template #actions-cell="{ row }">
                                <div class="flex justify-center">
                                    <UTooltip text="取消忽略">
                                        <UButton icon="i-lucide-rotate-ccw" color="gray" variant="soft"
                                            @click="handleIgnoreApi(row.original, 0)" />
                                    </UTooltip>
                                </div>
                            </template>

                            <template #empty>
                                <div
                                    class="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                                    <UIcon name="i-lucide-inbox" class="w-10 h-10 mb-2 opacity-50" />
                                    <p class="text-sm">暂无忽略路由</p>
                                </div>
                            </template>
                        </UTable>
                    </div>
                </div>
            </div>
        </template>

        <template #footer>
            <UButton color="gray" variant="ghost" @click="handleClose">
                取消
            </UButton>
            <UButton color="primary" icon="i-lucide-refresh-cw" @click="handleSyncAllApi">
                确认同步
            </UButton>
        </template>
    </USlideover>
</template>
