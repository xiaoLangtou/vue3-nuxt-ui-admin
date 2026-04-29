<script setup lang="ts">
import { ListSearch } from '@/components/custom-search';
import { HTTP_METHOD, HttpMethodCN } from '@/global/enums';
import type { IApiParams } from '@/services/types/api';
import type { FilterConfig, SearchParams } from '@/types/search';

const emit = defineEmits<{
    search: [params: Partial<IApiParams>];
    reset: [];
    sync: [];
    refreshCache: [];
    viewDoc: [];
    refresh: [];
    tableSetting: [];
}>();

const methodOptions = Object.values(HTTP_METHOD).map(method => ({
    label: `${method}(${HttpMethodCN[method]})`,
    value: method,
}));

const filterConfigs: FilterConfig[] = [
    {
        key: 'path',
        label: '接口路径',
        type: 'input',
        placeholder: '请输入接口路径',
    },
    {
        key: 'method',
        label: '请求方式',
        type: 'select',
        placeholder: '请选择请求方式',
        options: methodOptions,
    },
    {
        key: 'tags',
        label: '所属分组',
        type: 'input',
        placeholder: '请输入所属分组',
    },
    {
        key: 'description',
        label: '接口描述',
        type: 'input',
        placeholder: '请输入接口描述',
    },
];

const handleSearch = (params: SearchParams) => {
    const apiParams: Partial<IApiParams> = {
        path: params.filters?.path as string,
        method: params.filters?.method as any,
        tags: params.filters?.tags as string,
        description: params.filters?.description as string,
    };
    emit('search', apiParams);
};

const handleReset = () => {
    emit('reset');
};

defineOptions({
    name: 'ApiSearch',
});
</script>

<template>
    <ListSearch :filter-configs="filterConfigs" placeholder="搜索 API 路径、描述..." @search="handleSearch"
        @reset="handleReset">
        <template #actions>
            <UTooltip text="同步API">
                <UButton color="primary" icon="i-lucide-compass" @click="emit('sync')" />
            </UTooltip>
            <UTooltip text="刷新缓存">
                <UButton color="neutral" variant="outline" icon="i-lucide-refresh-cw" @click="emit('refreshCache')" />
            </UTooltip>

            <UTooltip text="查看文档">
                <UButton color="neutral" variant="outline" icon="i-lucide-bookmark" @click="emit('viewDoc')" />
            </UTooltip>
            <UTooltip text="表格设置">
                <UButton color="neutral" variant="outline" icon="i-lucide-settings-2" @click="emit('tableSetting')" />
            </UTooltip>
        </template>
    </ListSearch>
</template>
