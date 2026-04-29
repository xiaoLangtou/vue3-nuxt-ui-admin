<script lang="ts" setup>
import { useBatchAddDictDataMutation, useUpdateDictDataMutation } from '@/services/composables/useDictDataQuery';
import globalToast from '@/services/core/toast';
import type { IDictData } from '@/services/types/dict';
import type { TableColumn } from '@nuxt/ui';
import { STATUS_OPTIONS } from '../constants';

interface DictItemRow {
    id?: string | number;
    dictLabel: string;
    dictValue: string;
    dictSort: number;
    dictDesc: string;
    dictRemark: string;
    status: number;
}

const props = defineProps<{
    dictTypeId?: string | number;
    existingItems?: IDictData[];
    editItem?: IDictData | null;
}>();

const emit = defineEmits<{ success: [] }>();
const isOpen = defineModel<boolean>('open', {default: false});

const rows = ref<DictItemRow[]>([]);
const pasteText = ref('');
const showPasteArea = ref(false);

const isEditMode = computed(() => !!props.editItem);
const {mutateAsync: batchAdd, isPending: isAdding} = useBatchAddDictDataMutation();
const {mutateAsync: updateOne, isPending: isUpdating} = useUpdateDictDataMutation();
const isPending = computed(() => isAdding.value || isUpdating.value);

const columns: TableColumn<DictItemRow>[] = [
    {accessorKey: 'dictLabel', header: '字典标签', meta: {class: {th: 'w-[22%]', td: 'w-[22%]'}}},
    {accessorKey: 'dictValue', header: '字典值', meta: {class: {th: 'w-[18%]', td: 'w-[18%]'}}},
    {accessorKey: 'dictDesc', header: '描述', meta: {class: {th: 'w-[18%]', td: 'w-[18%]'}}},
    {accessorKey: 'dictSort', header: '排序', meta: {class: {th: 'w-[10%]', td: 'w-[10%]'}}},
    {accessorKey: 'status', header: '状态', meta: {class: {th: 'w-[12%]', td: 'w-[12%]'}}},
    {accessorKey: 'dictRemark', header: '备注', meta: {class: {th: 'w-[15%]', td: 'w-[15%]'}}},
    {id: 'actions', header: '操作', meta: {class: {th: 'w-[8%] text-center', td: 'w-[8%] text-center'}}},
];

const createEmpty = (): DictItemRow => ({
    dictLabel: '',
    dictValue: '',
    dictSort: (props.existingItems?.length ?? 0) + rows.value.length + 1,
    dictDesc: '',
    dictRemark: '',
    status: 1,
});

const toRow = (item: IDictData): DictItemRow => ({
    id: item.id,
    dictLabel: item.dictLabel,
    dictValue: item.dictValue,
    dictSort: item.dictSort ?? 0,
    dictDesc: item.dictDesc ?? '',
    dictRemark: item.dictRemark ?? '',
    status: item.status ?? 1,
});

watch(isOpen, (v: boolean) => {
    if (!v) return;
    rows.value = props.editItem ? [toRow(props.editItem)] : [createEmpty()];
    pasteText.value = '';
    showPasteArea.value = false;
});

const addRow = () => rows.value.push(createEmpty());
const removeRow = (i: number) => {
    if ( rows.value.length > 1 ) rows.value.splice(i, 1);
};

/**
 * 解析粘贴数据：
 * - JSON 数组/对象 (兼容 dictLabel/label/name、dictValue/value 等字段)
 * - Tab 分隔 (Excel 复制): 标签 \t 值 \t 排序 \t 描述 \t 备注
 */
const parsePasted = (text: string, startSort: number): DictItemRow[] => {
    const trimmed = text.trim();
    if ( !trimmed ) return [];

    if ( trimmed.startsWith('[') || trimmed.startsWith('{') ) {
        let json: any;
        try {
            json = JSON.parse(trimmed);
        } catch {
            throw new Error('JSON 格式错误');
        }
        const arr = Array.isArray(json) ? json : [ json ];
        return arr
            .map((it: any, idx: number): DictItemRow | null => {
                const label = it.dictLabel ?? it.label ?? it.name ?? '';
                const value = it.dictValue ?? it.value ?? '';
                if ( !label && !value ) return null;
                return {
                    dictLabel: String(label),
                    dictValue: String(value),
                    dictSort: Number(it.dictSort ?? it.sort) || ( startSort + idx ),
                    dictDesc: String(it.dictDesc ?? it.desc ?? ''),
                    dictRemark: String(it.dictRemark ?? it.remark ?? ''),
                    status: 1,
                };
            })
            .filter((x): x is DictItemRow => x !== null);
    }

    return text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line, idx): DictItemRow | null => {
            const [ label, value, sort, desc, remark ] = line.split('\t');
            if ( !label?.trim() && !value?.trim() ) return null;
            return {
                dictLabel: label?.trim() ?? '',
                dictValue: value?.trim() ?? '',
                dictSort: Number(sort) || ( startSort + idx ),
                dictDesc: desc?.trim() ?? '',
                dictRemark: remark?.trim() ?? '',
                status: 1,
            };
        })
        .filter((x): x is DictItemRow => x !== null);
};

const handlePaste = () => {
    try {
        const items = parsePasted(pasteText.value, (props.existingItems?.length ?? 0) + 1);
        if (!items.length) {
            globalToast.warn('未检测到有效数据，支持 JSON 数组或 Excel 复制格式');
            return;
        }
        rows.value = items;
        pasteText.value = '';
        showPasteArea.value = false;
        globalToast.success(`已导入 ${items.length} 行数据`);
    }
    catch (e) {
        globalToast.error(e instanceof Error ? e.message : '数据解析失败');
    }
};

const validate = (): boolean => {
    for ( let i = 0; i < rows.value.length; i++ ) {
        const r = rows.value[i];
        if ( !r.dictLabel?.trim() ) {
            globalToast.error(`第 ${ i + 1 } 行：字典标签不能为空`);
            return false;
        }
        if ( !r.dictValue?.trim() ) {
            globalToast.error(`第 ${ i + 1 } 行：字典值不能为空`);
            return false;
        }
    }
    const values = rows.value.map((r: DictItemRow) => r.dictValue);
    const existingValues = props.existingItems?.map((i: IDictData) => i.dictValue) ?? [];
    const dup = values.filter((v: string, i: number) =>
        values.indexOf(v) !== i || ( !isEditMode.value && existingValues.includes(v) )
    );
    if ( dup.length ) {
        globalToast.error(`字典值重复: ${ [ ...new Set(dup) ].join(', ') }`);
        return false;
    }
    return true;
};

const handleSubmit = async () => {
    if (!validate()) return;
    if (!props.dictTypeId) return globalToast.error('字典类型 ID 不能为空');

    const dictTypeId = Number(props.dictTypeId);
    try {
        if (isEditMode.value) {
            await updateOne({ ...rows.value[0], dictTypeId } as IDictData);
            globalToast.success('字典项已更新');
        }
        else {
            const list = rows.value.map((r): IDictData => ({ ...r, dictTypeId }));
            await batchAdd(list);
            globalToast.success(`成功添加 ${list.length} 个字典项`);
        }
        emit('success');
        isOpen.value = false;
    }
    catch {
        globalToast.error(isEditMode.value ? '更新失败' : '添加失败');
    }
};
</script>

<template>
    <UModal v-model:open="isOpen" :description="isEditMode ? '修改字典项信息' : '支持单个/批量添加，可从 Excel 粘贴数据'"
            :title="isEditMode ? '编辑字典项' : '添加字典项'"
            :ui="{ content: 'sm:max-w-[1000px]' }">
        <template #body>
            <div v-if="!isEditMode && !showPasteArea" class="flex justify-end mb-3">
                <UButton color="primary" icon="i-lucide-clipboard-paste" label="粘贴数据" size="sm" variant="soft"
                         @click="showPasteArea = true"/>
            </div>

            <div v-if="showPasteArea"
                 class="mb-3 p-3 border border-primary-200 dark:border-primary-800 rounded-lg bg-primary-50 dark:bg-primary-950">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium">粘贴数据 (支持 Excel/JSON)</span>
                    <UButton color="gray" icon="i-lucide-x" size="xs" variant="ghost"
                             @click="showPasteArea = false"/>
                </div>
                <UTextarea v-model="pasteText" :rows="5" class="mb-2 w-full" placeholder="粘贴 Excel 数据或 JSON 数组"/>
                <div class="flex gap-2">
                    <UButton color="primary" icon="i-lucide-check" label="导入" size="sm" @click="handlePaste"/>
                    <UButton color="gray" label="取消" size="sm" variant="ghost" @click="showPasteArea = false"/>
                </div>
            </div>

            <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div class="max-h-[450px] overflow-auto">
                    <UTable :columns="columns" :data="rows" class="w-full">
                        <template #dictLabel-header="{ column }">
                            <span>{{ column.columnDef.header }}</span><span class="text-red-500 ml-1">*</span>
                        </template>
                        <template #dictLabel-cell="{ row }">
                            <UInput v-model="row.original.dictLabel" class="w-full" placeholder="标签"/>
                        </template>
                        <template #dictValue-header="{ column }">
                            <span>{{ column.columnDef.header }}</span><span class="text-red-500 ml-1">*</span>
                        </template>
                        <template #dictValue-cell="{ row }">
                            <UInput v-model="row.original.dictValue" class="w-full" placeholder="值"/>
                        </template>
                        <template #dictDesc-cell="{ row }">
                            <UInput v-model="row.original.dictDesc" class="w-full" placeholder="描述"/>
                        </template>
                        <template #dictSort-cell="{ row }">
                            <UInput v-model.number="row.original.dictSort" class="w-full" type="number"/>
                        </template>
                        <template #status-cell="{ row }">
                            <USelect v-model="row.original.status" :items="STATUS_OPTIONS" class="w-full"/>
                        </template>
                        <template #dictRemark-cell="{ row }">
                            <UInput v-model="row.original.dictRemark" class="w-full" placeholder="备注"/>
                        </template>
                        <template #actions-cell="{ row }">
                            <UButton :disabled="rows.length <= 1" color="red" icon="i-lucide-trash-2" size="xs"
                                     variant="ghost" @click="removeRow(row.index)"/>
                        </template>
                    </UTable>
                </div>
            </div>

            <div v-if="!isEditMode" class="flex items-center justify-between mt-3">
                <UButton color="gray" icon="i-lucide-plus" label="添加一行" size="sm" variant="outline"
                         @click="addRow"/>
                <UBadge color="primary" variant="subtle">共 {{ rows.length }} 行</UBadge>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2 w-full">
                <UButton color="gray" label="取消" variant="ghost" @click="isOpen = false"/>
                <UButton :label="isEditMode ? '保存' : '提交'" :loading="isPending" color="primary"
                         icon="i-lucide-check"
                         @click="handleSubmit"/>
            </div>
        </template>
    </UModal>
</template>
