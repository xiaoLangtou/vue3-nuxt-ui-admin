<script lang="ts" setup>
import globalToast from '@/services/core/toast';
import { dictTypeService } from '@/services/modules/dict-type';
import type { IDictData, IDictType } from '@/services/types/dict';
import { to } from '@/utils/result-handler';
import { z } from 'zod';
import type { TableColumn } from '@nuxt/ui';
import { usePasteData } from '../composables/usePasteData';

// 定义事件
const emit = defineEmits(['success']);

const statusOptions = [
    { label: '启用', value: 1 },
    { label: '停用', value: 0 }
];

const state = reactive<Partial<IDictType>>({
    dictName: '',
    dictCode: '',
    dictDesc: '',
    systemFlag: '',
    status: 1
});

// 字典项数据
const dictItems = ref<IDictData[]>([]);
const editingRowId = ref<string | number | null>(null);

// 粘贴功能
const { pasteText, showPasteArea, handlePaste: handlePasteData, cancelPaste } = usePasteData();

// 表单验证 - 使用 Zod
const dictTypeSchema = z.object({
    dictCode: z.string().min(1, { message: '字典编码不能为空' }),
    dictName: z.string().min(1, { message: '字典名称不能为空' }),
    systemFlag: z
        .string()
        .min(1, { message: '请选择字典类型' })
        .refine((val) => ['BUSINESS', 'SYSTEM'].includes(val), { message: '字典类型必须是业务字典或系统字典' }),
    dictDesc: z.string().optional()
});

const drawerVisible = ref(false);
const formRef = ref();

const openDrawer = async (data: IDictType | Record<string, any> = {}) => {
    // 重置状态
    Object.assign(state, {
        id: data.id || undefined,
        dictName: data.dictName || '',
        dictCode: data.dictCode || '',
        dictDesc: data.dictDesc || '',
        systemFlag: data.systemFlag || '',
        status: data.status !== undefined ? data.status : 1
    });

    dictItems.value = []; // 如果有获取字典项的逻辑，应该在这里获取
    editingRowId.value = null;

    drawerVisible.value = true;
};

// 暴露方法供父组件调用
defineExpose({
    openDrawer
});

// 关闭抽屉
const closeDrawer = () => {
    drawerVisible.value = false;
};

/**
 * 表单提交处理函数
 */
const onFormSubmit = async (event: any) => {
    try {
        // 创建字典类型
        const dictDataList: IDictData[] = dictItems.value.map((item: IDictData) => {
            return {
                dictLabel: item.dictLabel,
                dictValue: item.dictValue,
                dictSort: item.dictSort,
                dictDesc: item.dictRemark,
                dictTypeId: undefined
            };
        });

        // 验证表格数据
        for (let i = 0; i < dictItems.value.length; i++) {
            const item = dictItems.value[i];
            if (!item.dictLabel || !item.dictValue) {
                globalToast.error(`第${i + 1}行字典项信息不完整`);
                return;
            }
        }

        const values = state;
        const typeResult = await to(
            state.id
                ? dictTypeService.updateDictType({
                    ...values,
                    dictDataList,
                    id: state.id
                } as any)
                : dictTypeService.addDictType({ ...values, dictDataList } as any)
        );
        if (!typeResult.ok) {
            globalToast.error(`【${values.dictName}】字典创建失败`, '提交失败');
            return;
        }
        globalToast.success(`【${values.dictName}】字典创建成功`, '提交成功');
        emit('success');
        closeDrawer();
    } catch (error) {
        console.error('表单提交错误:', error);
        globalToast.error('提交过程中发生错误', '提交失败');
    }
};

/**
 * 手动触发表单提交
 */
const handleSubmit = () => {
    formRef.value?.submit();
};

// 重置表单
const resetForm = () => {
    Object.assign(state, {
        dictName: '',
        dictCode: '',
        dictDesc: '',
        systemFlag: '',
        status: 1
    });
    dictItems.value = [];
    editingRowId.value = null;
};

const columnPinning = ref({
  right: ['actions']
})
// 表格列定义
const columns: TableColumn<IDictData>[] = [
    {
        accessorKey: 'dictLabel',
        header: '字典名称',
        meta: { class: { th: 'w-[25%]', td: 'w-[25%]' } }
    },
    {
        accessorKey: 'dictValue',
        header: '字典值',
        meta: { class: { th: 'w-[25%]', td: 'w-[25%]' } }
    },
    {
        accessorKey: 'dictRemark',
        header: '字典描述',
        meta: { class: { th: 'w-[35%]', td: 'w-[35%]' } }
    },
    {
        id: 'actions',
        header: '操作',
        meta: { class: { th: 'w-[15%]', td: 'w-[15%]' } }
    }
];

// 字典项操作
const addDictItem = () => {
    // 如果有正在编辑的行，先验证并尝试保存
    if (editingRowId.value !== null) {
        const editingRow = dictItems.value.find((item: IDictData) => item.id === editingRowId.value);
        if (editingRow) {
            // 验证必填项
            if (!editingRow.dictLabel || !editingRow.dictValue) {
                globalToast.error('请先完成当前行的编辑（字典名称和字典值不能为空）');
                return;
            }
            // 检查重复
            const exists = dictItems.value.some((item: IDictData) =>
                item.id !== editingRow.id &&
                (item.dictLabel === editingRow.dictLabel || item.dictValue === editingRow.dictValue)
            );
            if (exists) {
                globalToast.error('字典名称或值已存在');
                return;
            }
            // 自动保存成功，移除 isNew 标记
            if ((editingRow as any).isNew) delete (editingRow as any).isNew;
        }
    }

    const newItem: any = {
        id: Date.now(),
        dictLabel: '',
        dictValue: '',
        dictRemark: '',
        dictSort: dictItems.value.length + 1,
        isNew: true
    };
    dictItems.value.push(newItem);
    editingRowId.value = newItem.id;
};

const editRow = (row: any) => {
    editingRowId.value = row.id;
};

const saveRow = (row: any) => {
    if (!row.dictLabel || !row.dictValue) {
        globalToast.error('请填写字典名称和字典值');
        return;
    }
    // 检查重复
    const exists = dictItems.value.some((item: IDictData) => item.id !== row.id && (item.dictLabel === row.dictLabel || item.dictValue === row.dictValue));
    if (exists) {
        globalToast.error('字典名称或值已存在');
        return;
    }
    editingRowId.value = null;
    if (row.isNew) delete row.isNew;
};

const cancelRow = (row: any) => {
    if (row.isNew) {
        dictItems.value = dictItems.value.filter((item: IDictData) => item.id !== row.id);
    }
    editingRowId.value = null;
};

const deleteRow = (row: any) => {
    dictItems.value = dictItems.value.filter((item: IDictData) => item.id !== row.id);
};

/**
 * 处理粘贴数据
 */
const handlePaste = () => {
    handlePasteData((items) => {
        dictItems.value = items.map((item, index) => ({
            id: Date.now() + Math.random(),
            dictLabel: item.dictLabel,
            dictValue: item.dictValue,
            dictSort: item.dictSort || (index + 1),
            dictRemark: item.dictRemark || '',
        }));
        editingRowId.value = null;
    }, 1);
};
</script>

<template>
    <USlideover v-model:open="drawerVisible" :ui="{ content: 'sm:max-w-[800px] w-full' }"
        :title="state.id ? '编辑字典' : '新建字典'">
        <template #body>
            <UForm ref="formRef" :schema="dictTypeSchema" :state="state" class="space-y-4" @submit="onFormSubmit">
                <!-- 基本信息 -->
                <div class="flex items-center mb-4 mt-2">
                    <div
                        class="bg-primary-100 dark:bg-primary-900/30 p-1.5 rounded-md mr-3 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                        <UIcon name="i-lucide-library" class="w-5 h-5" />
                    </div>
                    <span class="font-bold text-lg text-gray-800 dark:text-gray-100">基本信息</span>
                    <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700 ml-4"></div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <UFormField label="字典名称" name="dictName" required>
                        <UInput v-model="state.dictName" placeholder="请输入字典名称" class="w-full" />
                    </UFormField>
                    <UFormField label="字典编码" name="dictCode" required>
                        <UInput v-model="state.dictCode" placeholder="请输入字典编码" class="w-full" />
                    </UFormField>
                    <UFormField label="字典类型" name="systemFlag" required>
                        <USelect v-model="state.systemFlag" :items="[
                            { label: '业务字典', value: 'BUSINESS' },
                            { label: '系统字典', value: 'SYSTEM' }
                        ]" placeholder="选择字典类型" class="w-full" />
                    </UFormField>
                    <UFormField label="状态" name="status">
                        <USelect v-model="state.status" :items="statusOptions" placeholder="选择状态" class="w-full" />
                    </UFormField>
                </div>

                <UFormField label="描述" name="dictDesc">
                    <UTextarea v-model="state.dictDesc" placeholder="请输入字典描述" class="w-full" />
                </UFormField>

                <!-- 字典项配置 -->
                <div class="flex items-center mb-4 mt-8">
                    <div
                        class="bg-primary-100 dark:bg-primary-900/30 p-1.5 rounded-md mr-3 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                        <UIcon name="i-lucide-list" class="w-5 h-5" />
                    </div>
                    <span class="font-bold text-lg text-gray-800 dark:text-gray-100">字典项配置</span>
                    <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700 ml-4"></div>
                </div>

                <!-- 粘贴区域 -->
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

                <div class="border rounded-lg border-gray-200 dark:border-gray-700 overflow-hidden">
                    <UTable v-model:column-pinning="columnPinning" :data="dictItems" :columns="columns">
                        <template #dictLabel-cell="{ row }">
                            <UInput v-if="editingRowId === row.original.id" v-model="row.original.dictLabel"
                                autofocus />
                            <span v-else>{{ row.original.dictLabel }}</span>
                        </template>
                        <template #dictValue-cell="{ row }">
                            <UInput v-if="editingRowId === row.original.id" v-model="row.original.dictValue" />
                            <UBadge v-else color="gray" variant="subtle" :label="row.original.dictValue"
                                class="font-mono" />
                        </template>
                        <template #dictRemark-cell="{ row }">
                            <UInput v-if="editingRowId === row.original.id" v-model="row.original.dictRemark" />
                            <span v-else>{{ row.original.dictRemark }}</span>
                        </template>
                        <template #actions-cell="{ row }">
                            <div class="flex items-center gap-1">
                                <template v-if="editingRowId === row.original.id">
                                    <UButton icon="i-lucide-check" color="green" variant="ghost"
                                        @click="saveRow(row.original)" />
                                    <UButton icon="i-lucide-x" color="gray" variant="ghost"
                                        @click="cancelRow(row.original)" />
                                </template>
                                <template v-else>
                                    <UButton icon="i-lucide-pencil" color="gray" variant="ghost"
                                        @click="editRow(row.original)" />
                                    <UButton icon="i-lucide-trash-2" color="red" variant="ghost"
                                        @click="deleteRow(row.original)" />
                                </template>
                            </div>
                        </template>
                        <template #empty>
                            <div
                                class="flex flex-col items-center justify-center py-6 text-center text-gray-400 dark:text-gray-500">
                                <UIcon name="i-lucide-inbox" class="w-8 h-8 mb-2" />
                                <p class="text-sm">暂无字典项</p>
                            </div>
                        </template>
                    </UTable>
                    <div class="p-2 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                        <UButton class="flex-1" variant="dashed" color="gray" icon="i-lucide-plus" label="添加字典项"
                            @click="addDictItem" />
                        <UButton v-if="!showPasteArea" icon="i-lucide-clipboard-paste" label="粘贴数据" color="primary"
                            variant="soft" @click="showPasteArea = true" />
                    </div>
                </div>
            </UForm>
        </template>

        <template #footer>
            <div class="flex justify-between items-center w-full">
                <div class="text-sm text-gray-500 flex items-center gap-2">
                    <UIcon name="i-lucide-info" class="text-blue-500 w-4 h-4" />
                    <span>请确保所有必填项已填写完整</span>
                </div>
                <div class="flex gap-3">
                    <UButton label="重置" color="gray" variant="outline" @click="resetForm" />
                    <UButton label="创建" color="primary" @click="handleSubmit" />
                </div>
            </div>
        </template>
    </USlideover>
</template>
