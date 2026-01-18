import { useLogsListQuery } from '@/services/composables/useLogsQuery';
import type { ILogs, ILogsQuery } from '@/services/types/logs';
import type { TableColumn } from '@nuxt/ui';

export const useLogsManagement = () => {
  const pageInfo = ref({
    current: 1,
    size: 20,
  });

  const searchParams = ref<ILogsQuery>({
    startTime: '',
    endTime: '',
    createBy: '',
    logType: '',
    module: '',
  });

  const logsQuery = computed(() => ({
    ...searchParams.value,
    current: pageInfo.value.current,
    size: pageInfo.value.size,
  }));

  const {
    data: logsData,
    isLoading,
    refetch: refetchLogs,
  } = useLogsListQuery(logsQuery);

  const logsList = computed(() => logsData.value?.records ?? []);
  const total = computed(() => logsData.value?.pager?.total ?? 0);

  const tableColumns: TableColumn<ILogs>[] = [
    { accessorKey: 'id', header: 'ID', meta: { class: { th: 'w-[80px]' } } },
    { accessorKey: 'logType', header: '日志类型' },
    { accessorKey: 'module', header: '所属模块' },
    { accessorKey: 'requestMethod', header: '请求方法', meta: { class: { th: 'w-[100px]' } } },
    { accessorKey: 'requestUrl', header: '请求地址' },
    { accessorKey: 'requestIp', header: '请求IP' },
    { accessorKey: 'requestTimeConsume', header: '耗时(ms)', meta: { class: { th: 'w-[100px]' } } },
    { accessorKey: 'status', header: '状态', meta: { class: { th: 'w-[80px]' } } },
    { accessorKey: 'createTime', header: '创建时间', meta: { class: { th: 'w-[180px]' } } },
    { id: 'actions', header: '操作', meta: { class: { th: 'w-[100px]' } } },
  ];

  const updateSearch = (params: Partial<ILogsQuery>) => {
    searchParams.value = { ...searchParams.value, ...params };
    pageInfo.value.current = 1;
  };

  const handlePageChange = (page: number) => {
    pageInfo.value.current = page;
  };

  const handleSizeChange = (size: number) => {
    pageInfo.value.size = size;
    pageInfo.value.current = 1;
  };

  return {
    logsList,
    total,
    isLoading,
    tableColumns,
    pageInfo,
    searchParams,
    updateSearch,
    handlePageChange,
    handleSizeChange,
    refetchLogs,
  };
};
