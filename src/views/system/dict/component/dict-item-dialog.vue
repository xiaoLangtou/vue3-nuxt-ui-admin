<script setup lang="ts">
import type { IDictData } from '@/services/types/dict';
import globalToast from '@/services/core/toast';
import { useAddDictDataMutation } from '@/services/composables/useDictDataQuery';
import { usePasteData } from '../composables/usePasteData';
import type { TableColumn } from '@nuxt/ui';

/**
 * 字典项编辑对话框 (统一版本)
 *
 * 功能:
 * - 支持单个/批量添加
 * - 支持手动逐行添加
 * - 支持从 Excel/JSON 粘贴批量导入
 * - 使用 UTable 行内编辑
 */

interface DictItem {
    tempId: string;
    dictLabel: string;
    dictValue: string;
    dictSort: number;
    dictRemark: string;
    status: number;
}

const props = defineProps<{
    dictTypeId?: string | number;
    existingItems?: IDictData[];
}>();

const emit = defineEmits<{
    success: [];
}>();

const isOpen = defineModel<boolean>('open', { default: false });

const dictItems = ref<DictItem[]>([]);

const { mutateAsync: addDictData, isPending } = useAddDictDataMutation();
const { pasteText, showPasteArea, handlePaste: handlePasteData, cancelPaste } = usePasteData();

const statusOptions = [
    { label: '启用', value: 1 },
    { label: '停用', value: 0 }
];

const columns: TableColumn<DictItem>[] = [
    { accessorKey: 'dictLabel', header: '字典标签', meta: { class: { th: 'w-[25%]', td: 'w-[25%]' } } },
    { accessorKey: 'dictValue', header: '字典值', meta: { class: { th: 'w-[20%]', td: 'w-[20%]' } } },
    { accessorKey: 'dictSort', header: '排序', meta: { class: { th: 'w-[10%]', td: 'w-[10%]' } } },
    { accessorKey: 'status', header: '状态', meta: { class: { th: 'w-[15%]', td: 'w-[15%]' } } },
    { accessorKey: 'dictRemark', header: '备注', meta: { class: { th: 'w-[20%]', td: 'w-[20%]' } } },
    { id: 'actions', header: '操作', meta: { class: { th: 'w-[10%] text-center', td: 'w-[10%] text-center' } } },
];

const generateTempId = () => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const initDictItems = () => {
    dictItems.value = [createEmptyItem()];
    cancelPaste();
};

const createEmptyItem = (): DictItem => {
    return {
        tempId: generateTempId(),
        dictLabel: '',
        dictValue: '',
        dictSort: (props.existingItems?.length || 0) + dictItems.value.length + 1,
        dictRemark: '',
        status: 1,
    };
};

const addRow = () => {
    dictItems.value.push(createEmptyItem());
};

const removeRow = (index: number) => {
    if (dictItems.value.length > 1) {
        dictItems.value.splice(index, 1);
        dictItems.value.forEach((item: DictItem, idx: number) => {
            item.dictSort = (props.existingItems?.length || 0) + idx + 1;
        });
    }
};

const handlePaste = () => {
    const startSort = (props.existingItems?.length || 0) + 1;
    handlePasteData((items) => {
        dictItems.value = items.map(item => ({
            tempId: generateTempId(),
            dictLabel: item.dictLabel,
            dictValue: item.dictValue,
            dictSort: item.dictSort || startSort,
            dictRemark: item.dictRemark || '',
            status: 1,
        }));
    }, startSort);
};

const validateItems = (): boolean => {
    for (let i = 0; i < dictItems.value.length; i++) {
        const item = dictItems.value[i];
        if (!item.dictLabel?.trim()) {
            globalToast.error(`第 ${i + 1} 行:字典标签不能为空`);
            return false;
        }
        if (!item.dictValue?.trim()) {
            globalToast.error(`第 ${i + 1} 行:字典值不能为空`);
            return false;
        }
    }

    const values = dictItems.value.map((item: DictItem) => item.dictValue);
    const existingValues = props.existingItems?.map((item: IDictData) => item.dictValue) || [];
    const duplicates = values.filter((v: string, i: number) => values.indexOf(v) !== i || existingValues.includes(v));

    if (duplicates.length > 0) {
        globalToast.error(`字典值重复: ${[...new Set(duplicates)].join(', ')}`);
        return false;
    }

    return true;
};

const handleSubmit = async () => {
    if (!validateItems()) return;
    if (!props.dictTypeId) {
        globalToast.error('字典类型ID不能为空');
        return;
    }

    try {
        for (const item of dictItems.value) {
            await addDictData({
                dictTypeId: props.dictTypeId,
                dictLabel: item.dictLabel,
                dictValue: item.dictValue,
                dictSort: item.dictSort,
                dictRemark: item.dictRemark,
                status: item.status,
            } as IDictData);
        }

        globalToast.success(`成功添加 ${dictItems.value.length} 个字典项`);
        emit('success');
        isOpen.value = false;
    } catch (error) {
        globalToast.error('添加失败');
    }
};

watch(isOpen, (val: boolean) => {
    if (val) {
        initDictItems();
    }
});
</script>

<template>
    <UModal v-model:open="isOpen" title="添加字典项" description="支持单个/批量添加,可从 Excel 粘贴数据"
        :ui="{ content: 'sm:max-w-5xl' }">
        <template #body>
            <div v-if="!showPasteArea" class="flex justify-end mb-4">
                <UButton icon="i-lucide-clipboard-paste" label="粘贴数据" color="primary" variant="soft" size="sm"
                    @click="showPasteArea = true" />
            </div>

            <div v-if="showPasteArea"
                class="mb-4 p-4 border border-primary-200 dark:border-primary-800 rounded-lg bg-primary-50 dark:bg-primary-950">
                <div class="flex items-center justify-between mb-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">粘贴数据 (支持 Excel/JSON)</label>
                    <UButton icon="i-lucide-x" color="gray" variant="ghost" size="xs" @click="cancelPaste" />
                </div>
                <UTextarea v-model="pasteText" :rows="5" placeholder="粘贴 Excel 数据或 JSON 数组" class="mb-2 w-full" />
                <div class="flex gap-2">
                    <UButton icon="i-lucide-check" label="导入" color="primary" size="sm" @click="handlePaste" />
                    <UButton icon="i-lucide-x" label="取消" color="gray" variant="ghost" size="sm"
                        @click="cancelPaste" />
                </div>
            </div>

            <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div class="overflow-x-auto max-h-[450px] overflow-y-auto">
                    <UTable :data="dictItems" :columns="columns" class="w-full">
                        <template #dictLabel-header="{ column }">
                            <span>{{ column.columnDef.header }}</span> <span class="text-red-500">*</span>
                        </template>
                        <template #dictLabel-cell="{ row }">
                            <UInput v-model="row.original.dictLabel" placeholder="请输入标签" class="w-full" />
                        </template>

                        <template #dictValue-header="{ column }">
                            <span>{{ column.columnDef.header }}</span> <span class="text-red-500">*</span>
                        </template>
                        <template #dictValue-cell="{ row }">
                            <UInput v-model="row.original.dictValue" placeholder="请输入值" class="w-full" />
                        </template>

                        <template #dictSort-cell="{ row }">
                            <UInput v-model.number="row.original.dictSort" type="number" class="w-full" />
                        </template>

                        <template #status-cell="{ row }">
                            <USelect v-model="row.original.status" :options="statusOptions" option-attribute="label"
                                value-attribute="value" class="w-full" />
                        </template>

                        <template #dictRemark-cell="{ row }">
                            <UInput v-model="row.original.dictRemark" placeholder="请输入备注" class="w-full" />
                        </template>

                        <template #actions-cell="{ row }">
                            <div class="flex justify-center">
                                <UButton icon="i-lucide-trash-2" color="red" variant="ghost"
                                    :disabled="dictItems.length <= 1" @click="removeRow(row.index)" />
                            </div>
                        </template>
                    </UTable>
                </div>
            </div>

            <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-2">
                    <UButton icon="i-lucide-plus" label="添加一行" color="gray" variant="outline" @click="addRow" />
                    <UBadge color="primary" variant="subtle">
                        共 {{ dictItems.length }} 行
                    </UBadge>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2 w-full">
                <UButton label="取消" color="gray" variant="ghost" @click="isOpen = false" />
                <UButton label="提交" icon="i-lucide-check" color="primary" :loading="isPending" @click="handleSubmit" />
            </div>
        </template>
    </UModal>
</template>
