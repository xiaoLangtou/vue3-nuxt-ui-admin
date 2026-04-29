import type { TableColumn } from '@nuxt/ui';
import type { IApi, IApiParams } from '@/services/types/api';
import { useApiListQuery } from '@/services/composables/useApiQuery';

export const useApiManagement = () => {
    const pageInfo = ref({
        current: 1,
        size: 10,
    });

    const searchParams = ref<Partial<IApiParams>>({
        path: '',
        method: undefined,
        tags: '',
        description: '',
    });

    const queryParams = computed<IApiParams>(() => ( {
        current: pageInfo.value.current,
        size: pageInfo.value.size,
        path: searchParams.value.path,
        method: searchParams.value.method,
        tags: searchParams.value.tags,
        description: searchParams.value.description,
    } ));

    const {data: apiResponse, isLoading, refetch} = useApiListQuery(queryParams);

    const apiData = computed(() => apiResponse.value?.records || []);
    const total = computed(() => apiResponse.value?.pager?.total || 0);

    const tableColumns: TableColumn<IApi>[] = [
        {
            accessorKey: 'path',
            header: 'API路径',
            meta: {
                class: {
                    th: 'w-[300px]',
                    td: 'w-[300px]'
                },
            },
        },
        {
            accessorKey: 'apiGroup',
            header: 'API分组',
            meta: {
                class: {
                    th: 'w-[180px]',
                    td: 'w-[180px]'
                },
            },
        },
        {
            accessorKey: 'description',
            header: 'API简介',
            meta: {
                class: {
                    th: 'w-[350px]',
                    td: 'w-[350px]'
                },
            },
        },
        {
            accessorKey: 'method',
            header: '请求方式',
            meta: {
                class: {
                    th: 'w-[150px]',
                    td: 'w-[150px]'
                },
            },
        },
    ];

    const fetchApiList = () => {
        refetch();
    };

    const updateSearch = (params: Partial<IApiParams>) => {
        searchParams.value = {...searchParams.value, ...params};
        pageInfo.value.current = 1;
    };

    const handlePageChange = (page: number) => {
        pageInfo.value.current = page;
    };

    const handleSizeChange = (size: number) => {
        pageInfo.value.size = size;
        pageInfo.value.current = 1;
    };

    const resetSearch = () => {
        searchParams.value = {
            path: '',
            method: undefined,
            tags: '',
            description: '',
        };
        pageInfo.value.current = 1;
    };

    return {
        apiData,
        total,
        isLoading,
        tableColumns,
        pageInfo,
        searchParams,
        fetchApiList,
        updateSearch,
        handlePageChange,
        handleSizeChange,
        resetSearch,
    };
};
