<script lang="ts" setup>
import { useNuxtConfirm } from '@/composables/useNuxtConfirm';
import { useDictDataListQuery, useRemoveDictDataMutation } from '@/services/composables/useDictDataQuery';
import { useDictTypeInfiniteQuery, useRemoveDictTypeMutation } from '@/services/composables/useDictTypeQuery';
import type { IDictData, IDictType, IDictTypeQuery } from '@/services/types/dict';
import { watchDebounced } from '@vueuse/core';
import DictItemDialog from './component/dict-item-dialog.vue';
import DictItemPanel from './component/dict-item-panel.vue';
import DictTypeForm from './component/dict-type-form.vue';
import DictTypeList from './component/dict-type-list.vue';

const { confirmDelete } = useNuxtConfirm();

// 字典类型（无限滚动 + 防抖搜索）
const searchValue = ref('');
const searchQuery = ref<IDictTypeQuery>({ dictName: '' });
watchDebounced(searchValue, (v) => { searchQuery.value = { dictName: v }; }, { debounce: 500 });

const {
    data: dictTypePages,
    isLoading: dictTypeLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch: refetchDictTypes,
} = useDictTypeInfiniteQuery(searchQuery, 15);

const dictTypeList = computed<IDictType[]>(() =>
    dictTypePages.value?.pages.flatMap((p) => p.records || []) ?? []
);
const totalDictTypes = computed(() => dictTypePages.value?.pages[0]?.pager.total ?? 0);

// 选中的字典类型 + 字典项查询
const selectedDictType = ref<IDictType>();
watch(dictTypeList, (list) => {
    if (list.length && !selectedDictType.value) selectedDictType.value = list[0];
}, { immediate: true });

const dictItemQuery = computed(() => ({
    typeId: selectedDictType.value?.id as number,
    current: 1,
    size: 100,
    dictName: '',
}));
const {
    data: dictItemsData,
    isLoading: itemsLoading,
    refetch: refetchDictItems,
} = useDictDataListQuery(dictItemQuery, { enabled: computed(() => !!selectedDictType.value?.id) });
const dictItems = computed<IDictData[]>(() => dictItemsData.value?.records ?? []);

// 删除
const { mutateAsync: removeDictType } = useRemoveDictTypeMutation();
const { mutateAsync: removeDictItem } = useRemoveDictDataMutation();

const handleDeleteDictType = (dict: IDictType) => {
    confirmDelete({
        title: '确认删除',
        message: `确定要删除字典类型 "${dict.dictName}(${dict.dictCode})" 吗？`,
        accept: async () => {
            await removeDictType(dict.id as string | number);
            await refetchDictTypes();
        },
    });
};

const handleDeleteDictItem = (item: IDictData) => {
    confirmDelete({
        title: '确认删除',
        message: `确定要删除字典项 "${item.dictLabel}" 吗？`,
        accept: async () => {
            await removeDictItem(item.id as string);
            await refetchDictItems();
        },
    });
};

// 弹窗
const dictTypeForm = useTemplateRef<InstanceType<typeof DictTypeForm>>('dictTypeForm');
const dictItemDialogVisible = ref(false);
const editingDictItem = ref<IDictData | null>(null);

const openDictItemDialog = (item: IDictData | null = null) => {
    editingDictItem.value = item;
    dictItemDialogVisible.value = true;
};
</script>

<template>
    <div class="h-[calc(100vh-182px)] flex overflow-hidden gap-3">
        <DictTypeList
            v-model:search="searchValue"
            :list="dictTypeList"
            :total="totalDictTypes"
            :loading="dictTypeLoading"
            :fetching-more="isFetchingNextPage"
            :selected-id="selectedDictType?.id"
            @select="selectedDictType = $event"
            @edit="dictTypeForm?.openDrawer($event)"
            @remove="handleDeleteDictType"
            @create="dictTypeForm?.openDrawer()"
            @scroll-end="hasNextPage && !isFetchingNextPage && fetchNextPage()"
        />

        <DictItemPanel
            :dict-type="selectedDictType"
            :items="dictItems"
            :loading="itemsLoading"
            @add="openDictItemDialog()"
            @edit="openDictItemDialog($event)"
            @remove="handleDeleteDictItem"
        />

        <DictTypeForm ref="dictTypeForm" @success="refetchDictTypes" />
        <DictItemDialog
            v-model:open="dictItemDialogVisible"
            :dict-type-id="selectedDictType?.id"
            :existing-items="dictItems"
            :edit-item="editingDictItem"
            @success="refetchDictItems"
        />
    </div>
</template>
