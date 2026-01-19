import { useLogsListQuery } from '@/services/composables/useLogsQuery';
import type { ILogs, ILogsQuery } from '@/services/types/logs';
import type { TableColumn } from '@nuxt/ui';

export const useLogsManagement = () => {
  const pageInfo = ref({
    current: 1,
    size: 10,
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
    { accessorKey: 'logContent', header: '操作内容', meta: { class: { th: 'w-[200px]' } } },
    { accessorKey: 'module', header: '所属模块' },
    { accessorKey: 'createBy', header: '操作人' },
    { accessorKey: 'requestTimeConsume', header: '请求耗时' },
    { accessorKey: 'status', header: '状态', meta: { class: { th: 'w-[80px]' } } },
    { accessorKey: 'requestIp', header: '请求IP' },
    { accessorKey: 'requestIpAddr', header: '地理位置' },
    { accessorKey: 'browser', header: '浏览器' },
    { accessorKey: 'os', header: '操作系统' },
    { id: 'actions', header: '操作', meta: { class: { th: 'w-[100px] text-center', td: "w-[100px] text-center" } } },
  ];

  const updateSearch = (params: Partial<ILogsQuery>) => {
    searchParams.value = { ...searchParams.value, ...params };
    pageInfo.value.current = 1;
  };

  const handlePageChange = (page: number) => {
    console.log(page,"page")
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
