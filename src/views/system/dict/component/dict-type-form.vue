<script lang="ts" setup>
import { useAddDictTypeMutation, useUpdateDictTypeMutation } from '@/services/composables/useDictTypeQuery';
import globalToast from '@/services/core/toast';
import type { IDictType } from '@/services/types/dict';
import { z } from 'zod';
import { STATUS_OPTIONS, SYSTEM_FLAG_OPTIONS } from '../constants';

const emit = defineEmits<{ success: [] }>();

const drawerVisible = ref(false);
const formRef = ref();

const createInitialState = (): Partial<IDictType> => ({
    id: undefined,
    dictName: '',
    dictCode: '',
    dictDesc: '',
    systemFlag: '',
    status: 1,
});

const state = reactive<Partial<IDictType>>(createInitialState());
const isEdit = computed(() => !!state.id);

const schema = z.object({
    dictCode: z.string().min(1, { message: '字典编码不能为空' }),
    dictName: z.string().min(1, { message: '字典名称不能为空' }),
    systemFlag: z.enum(['BUSINESS', 'SYSTEM'], { message: '请选择字典类型' }),
    dictDesc: z.string().optional(),
});

const { mutateAsync: addDictType, isPending: isAdding } = useAddDictTypeMutation();
const { mutateAsync: updateDictType, isPending: isUpdating } = useUpdateDictTypeMutation();
const isPending = computed(() => isAdding.value || isUpdating.value);

const openDrawer = (data: Partial<IDictType> = {}) => {
    Object.assign(state, createInitialState(), data);
    drawerVisible.value = true;
};

defineExpose({ openDrawer });

const onSubmit = async () => {
    try {
        const action = isEdit.value ? updateDictType : addDictType;
        await action(state as IDictType);
        globalToast.success(`【${state.dictName}】已${isEdit.value ? '更新' : '创建'}`);
        emit('success');
        drawerVisible.value = false;
    }
    catch {
        globalToast.error(isEdit.value ? '更新失败' : '创建失败');
    }
};
</script>

<template>
    <USlideover v-model:open="drawerVisible" :title="isEdit ? '编辑字典' : '新建字典'"
        :ui="{ content: 'sm:max-w-[600px] w-full' }">
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <div class="grid grid-cols-2 gap-4">
                    <UFormField label="字典名称" name="dictName" required>
                        <UInput v-model="state.dictName" placeholder="请输入字典名称" class="w-full" />
                    </UFormField>
                    <UFormField label="字典编码" name="dictCode" required>
                        <UInput v-model="state.dictCode" placeholder="请输入字典编码" class="w-full" />
                    </UFormField>
                    <UFormField label="字典类型" name="systemFlag" required>
                        <USelect v-model="state.systemFlag" :items="SYSTEM_FLAG_OPTIONS" placeholder="选择字典类型"
                            class="w-full" />
                    </UFormField>
                    <UFormField label="状态" name="status">
                        <USelect v-model="state.status" :items="STATUS_OPTIONS" class="w-full" />
                    </UFormField>
                </div>
                <UFormField label="描述" name="dictDesc">
                    <UTextarea v-model="state.dictDesc" placeholder="请输入字典描述" class="w-full" />
                </UFormField>
            </UForm>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2 w-full">
                <UButton label="取消" color="gray" variant="ghost" @click="drawerVisible = false" />
                <UButton :label="isEdit ? '保存' : '创建'" color="primary" :loading="isPending"
                    @click="formRef?.submit()" />
            </div>
        </template>
    </USlideover>
</template>
