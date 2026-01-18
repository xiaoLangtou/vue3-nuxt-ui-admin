import type { IDictData, IDictType, IDictTypeQuery } from '@/services/types/dict';
import type { IPageResult } from '@/services/types/types';
import { useDictDataListQuery, useRemoveDictDataMutation } from '@/services/composables/useDictDataQuery';
import { useDictTypeInfiniteQuery, useRemoveDictTypeMutation } from '@/services/composables/useDictTypeQuery';

/**
 * 字典管理业务逻辑封装
 *
 * 职责:
 * - 管理字典类型和字典项的状态
 * - 封装业务逻辑和数据转换
 * - 提供统一的操作接口
 */
export const useDictManagement = () => {
  // ==================== 字典类型管理 ====================

  const searchQuery = ref<IDictTypeQuery>({ dictName: '' });
  const pageSize = 15;

  /**
   * 字典类型无限滚动查询
   */
  const {
    data: dictTypePages,
    isLoading: dictTypeLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch: refetchDictTypes,
  } = useDictTypeInfiniteQuery(searchQuery, pageSize);

  /**
   * 展平的字典类型列表
   */
  const dictTypeList = computed<IDictType[]>(() => {
    if (!dictTypePages.value?.pages) return [];
    return dictTypePages.value.pages.flatMap(
      (page: IPageResult<IDictType>) => page.records || []
    );
  });

  /**
   * 字典类型总数
   */
  const totalDictTypes = computed(() => {
    return dictTypePages.value?.pages[0]?.pager.total || 0;
  });

  /**
   * 更新搜索条件
   */
  const updateSearch = (keyword: string) => {
    searchQuery.value = { dictName: keyword };
  };

  /**
   * 加载更多字典类型
   */
  const loadMoreDictTypes = () => {
    if (hasNextPage.value && !isFetchingNextPage.value) {
      fetchNextPage();
    }
  };

  // ==================== 字典项管理 ====================

  const selectedDictType = ref<IDictType>();
  const selectedDictTypeId = computed(() => selectedDictType.value?.id);

  /**
   * 字典项查询参数
   */
  const dictItemQuery = computed(() => ({
    typeId: selectedDictTypeId.value as number,
    current: 1,
    size: 100,
    dictName: '',
  }));

  /**
   * 字典项列表查询
   * 初始禁用,通过 watch 手动触发
   */
  const {
    data: dictItemsData,
    isLoading: itemsLoading,
    refetch: refetchDictItems,
  } = useDictDataListQuery(dictItemQuery, { enabled: false });

  /**
   * 监听字典类型 ID 变化,自动请求字典项
   */
  watch(
    selectedDictTypeId,
    (newId: string | number | undefined) => {
      if (newId) {
        refetchDictItems();
      }
    },
    { immediate: true }
  );

  /**
   * 字典项列表
   */
  const dictItems = computed<IDictData[]>(() => {
    return dictItemsData.value?.records || [];
  });

  /**
   * 选择字典类型
   */
  const selectDictType = (dictType: IDictType) => {
    selectedDictType.value = dictType;
  };

  // ==================== 删除操作 ====================

  const { mutateAsync: removeDictTypeMutation } = useRemoveDictTypeMutation();
  const { mutateAsync: removeDictItemMutation } = useRemoveDictDataMutation();

  /**
   * 删除字典类型
   */
  const deleteDictType = async (id: string | number) => {
    await removeDictTypeMutation(id);
    await refetchDictTypes();
  };

  /**
   * 删除字典项
   */
  const deleteDictItem = async (id: string) => {
    await removeDictItemMutation(id);
    await refetchDictItems();
  };

  // ==================== 表格配置 ====================

  /**
   * 字典项表格列配置 (Nuxt UI 格式)
   */
  const tableColumns = [
    { accessorKey: 'dictLabel', header: '字典标签' },
    { accessorKey: 'dictValue', header: '字典值' },
    { accessorKey: 'dictSort', header: '排序' },
    { accessorKey: 'status', header: '状态' },
    { accessorKey: 'isDefault', header: '默认值' },
    { accessorKey: 'dictRemark', header: '备注' },
    { accessorKey: 'createTime', header: '创建时间' },
    { id: 'actions', header: '操作' },
  ];

  // ==================== 初始化 ====================

  /**
   * 自动选择第一个字典类型
   */
  watch(
    dictTypeList,
    (list: IDictType[]) => {
      if (list.length > 0 && !selectedDictType.value) {
        selectedDictType.value = list[0];
      }
    },
    { immediate: true }
  );

  return {
    // 字典类型
    dictTypeList,
    totalDictTypes,
    dictTypeLoading,
    isFetchingNextPage,
    updateSearch,
    loadMoreDictTypes,
    refetchDictTypes,

    // 字典项
    selectedDictType,
    selectedDictTypeId,
    dictItems,
    itemsLoading,
    refetchDictItems,
    selectDictType,

    // 删除操作
    deleteDictType,
    deleteDictItem,

    // 表格配置
    tableColumns,
  };
};
