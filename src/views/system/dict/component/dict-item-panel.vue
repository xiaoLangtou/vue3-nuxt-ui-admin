<script lang="ts" setup>
import type { IDictData, IDictType } from '@/services/types/dict';
import { dictItemColumns, SYSTEM_FLAG_LABEL } from '../constants';

defineProps<{
    dictType?: IDictType;
    items: IDictData[];
    loading: boolean;
}>();

const emit = defineEmits<{
    add: [];
    edit: [item: IDictData];
    remove: [item: IDictData];
}>();
</script>

<template>
    <div class="flex-1 flex flex-col bg-white dark:bg-gray-800 border border-neutral-100 dark:border-gray-700 rounded-xl">
        <div class="px-6 py-3 border-b border-gray-100 dark:border-gray-700">
            <div v-if="dictType" class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <h3 class="text-base font-semibold m-0">{{ dictType.dictName }}</h3>
                    <UBadge :color="dictType.systemFlag === 'SYSTEM' ? 'error' : 'info'"
                        :label="SYSTEM_FLAG_LABEL[dictType.systemFlag]" size="sm" variant="subtle" />
                    <span class="text-sm text-gray-500">{{ dictType.dictCode }}</span>
                </div>
                <UButton icon="i-lucide-plus" label="添加字典项" size="sm" @click="emit('add')" />
            </div>
            <div v-else class="text-sm text-gray-500">请选择字典类型</div>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-4">
            <div v-if="!dictType" class="flex flex-col items-center justify-center h-full text-gray-400">
                <p>请从左侧选择一个字典类型</p>
            </div>
            <UTable v-else :columns="dictItemColumns" :data="items" :loading="loading" class="w-full">
                <template #dictLabel-cell="{ row }">
                    <div class="flex items-center gap-2">
                        <span class="font-medium">{{ row.original.dictLabel }}</span>
                        <UIcon v-if="row.original.isDefault == 1" v-tooltip.top="'默认值'"
                            class="w-4 h-4 text-yellow-500 fill-yellow-500" name="i-lucide-star" />
                    </div>
                </template>
                <template #dictValue-cell="{ row }">
                    <UBadge :label="row.original.dictValue" class="font-mono" color="gray" variant="subtle" />
                </template>
                <template #status-cell="{ row }">
                    <UBadge :color="row.original.status == 1 ? 'success' : 'error'"
                        :label="row.original.status == 1 ? '启用' : '停用'" variant="subtle" />
                </template>
                <template #actions-cell="{ row }">
                    <div class="flex items-center gap-1">
                        <UButton v-tooltip.bottom="'编辑'" color="gray" icon="i-lucide-pencil" size="xs" variant="ghost"
                            @click="emit('edit', row.original)" />
                        <UButton v-tooltip.bottom="'删除'" color="red" icon="i-lucide-trash-2" size="xs" variant="ghost"
                            @click="emit('remove', row.original)" />
                    </div>
                </template>
                <template #empty>
                    <div class="flex flex-col items-center py-6 text-gray-400">
                        <p>暂无数据</p>
                    </div>
                </template>
            </UTable>
        </div>
    </div>
</template>
