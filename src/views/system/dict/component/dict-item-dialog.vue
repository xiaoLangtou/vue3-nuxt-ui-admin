<script setup lang="ts">
import type { IDictData } from '@/services/types/dict';
import globalToast from '@/services/core/toast';
import { useBatchAddDictDataMutation, useUpdateDictDataMutation } from '@/services/composables/useDictDataQuery';
import { usePasteData } from '../composables/usePasteData';
import type { TableColumn } from '@nuxt/ui';

/**
 * 字典项编辑对话框 (统一版本)
 *
 * 功能:
 * - 支持单个编辑
 * - 支持单个/批量添加
 * - 支持手动逐行添加
 * - 支持从 Excel/JSON 粘贴批量导入
 * - 使用 UTable 行内编辑
 */

interface DictItem {
    id?: string | number;
    tempId?: string;
    dictLabel: string;
    dictValue: string;
    dictSort: number;
    dictDesc: string;
    status: number;
    dictRemark?: string;
}

const props = defineProps<{
    dictTypeId?: string | number;
    existingItems?: IDictData[];
    editItem?: IDictData | null;
}>();

const emit = defineEmits<{
    success: [];
}>();

const isOpen = defineModel<boolean>('open', { default: false });

const dictItems = ref<DictItem[]>([]);

const { mutateAsync: batchAddDictData, isPending: isAdding } = useBatchAddDictDataMutation();
const { mutateAsync: updateDictData, isPending: isUpdating } = useUpdateDictDataMutation();
const { pasteText, showPasteArea, handlePaste: handlePasteData, cancelPaste } = usePasteData();

const isPending = computed(() => isAdding.value || isUpdating.value);
const isEditMode = computed(() => !!props.editItem);

const statusOptions = [
    { label: '启用', value: 1 },
    { label: '停用', value: 0 }
];

const columns: TableColumn<DictItem>[] = [
    { accessorKey: 'dictLabel', header: '字典标签', meta: { class: { th: 'w-[25%]', td: 'w-[25%]' } } },
    { accessorKey: 'dictValue', header: '字典值', meta: { class: { th: 'w-[20%]', td: 'w-[20%]' } } },
    { accessorKey: 'dictDesc', header: '字典描述', meta: { class: { th: 'w-[20%]', td: 'w-[20%]' } } },
    { accessorKey: 'dictSort', header: '排序', meta: { class: { th: 'w-[10%]', td: 'w-[10%]' } } },
    { accessorKey: 'status', header: '状态', meta: { class: { th: 'w-[15%]', td: 'w-[15%]' } } },
    { accessorKey: 'remark', header: '备注', meta: { class: { th: 'w-[15%]', td: 'w-[15%]' } } },
    { id: 'actions', header: '操作', meta: { class: { th: 'w-[10%] text-center', td: 'w-[10%] text-center' } } },
];

const generateTempId = () => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const initDictItems = () => {
    if (props.editItem) {
        // 编辑模式:加载现有数据
        dictItems.value = [{
            id: props.editItem.id,
            dictLabel: props.editItem.dictLabel,
            dictValue: props.editItem.dictValue,
            dictSort: props.editItem.dictSort || 0,
            dictDesc: props.editItem.dictDesc || '',
            dictRemark: props.editItem.dictRemark || '',
            status: props.editItem.status ?? 1,
        }];
    } else {
        // 新增模式:创建空行
        dictItems.value = [createEmptyItem()];
    }
    cancelPaste();
};

const createEmptyItem = (): DictItem => {
    return {
        tempId: generateTempId(),
        dictLabel: '',
        dictValue: '',
        dictSort: (props.existingItems?.length || 0) + dictItems.value.length + 1,
        dictDesc: '',
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
            dictDesc: item.dictDesc || '',
            dictRemark: item.remark || '',
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
        if (isEditMode.value) {
            // 编辑模式:更新单个字典项
            const item = dictItems.value[0];
            await updateDictData({
                id: item.id,
                dictTypeId: props.dictTypeId,
                dictLabel: item.dictLabel,
                dictValue: item.dictValue,
                dictSort: item.dictSort,
                dictDesc: item.dictDesc,
                dictRemark: item.dictRemark,
                status: item.status,
            } as IDictData);
            globalToast.success('字典项已更新');
        } else {
            // 新增模式:批量添加
            const dataList = dictItems.value.map((item: DictItem) => ({
                dictTypeId: props.dictTypeId,
                dictLabel: item.dictLabel,
                dictValue: item.dictValue,
                dictSort: item.dictSort,
                dictDesc: item.dictDesc,
                dictRemark: item.dictRemark,
                status: item.status,
            } as IDictData));

            await batchAddDictData(dataList);
            globalToast.success(`成功添加 ${dictItems.value.length} 个字典项`);
        }

        emit('success');
        isOpen.value = false;
    } catch (error) {
        globalToast.error(isEditMode.value ? '更新失败' : '添加失败');
    }
};

watch(isOpen, (val: boolean) => {
    if (val) {
        initDictItems();
    }
});
</script>

<template>
    <UModal v-model:open="isOpen" :title="isEditMode ? '编辑字典项' : '添加字典项'"
        :description="isEditMode ? '修改字典项信息' : '支持单个/批量添加,可从 Excel 粘贴数据'"
        :ui="{ content: 'sm:max-w-[1000px]' }">
        <template #body>
            <div v-if="!showPasteArea && !isEditMode" class="flex justify-end mb-4">
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
                    <UButton icon="i-lucide-x" label="取消" color="gray" variant="ghost" size="sm" @click="cancelPaste" />
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
                            <USelect v-model="row.original.status" :items="statusOptions" option-attribute="label"
                                value-attribute="value" class="w-full" />
                        </template>

                        <template #dictDesc-cell="{ row }">
                            <UInput v-model="row.original.dictDesc" placeholder="请输入备注" class="w-full" />
                        </template>
                        <template #remark-cell="{ row }">
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

            <div v-if="!isEditMode" class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                <UButton :label="isEditMode ? '保存' : '提交'" icon="i-lucide-check" color="primary" :loading="isPending" @click="handleSubmit" />
            </div>
        </template>
    </UModal>
</template>
