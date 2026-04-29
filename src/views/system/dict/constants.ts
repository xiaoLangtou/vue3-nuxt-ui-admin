import type { IDictData } from '@/services/types/dict';
import type { TableColumn } from '@nuxt/ui';

export const SYSTEM_FLAG_OPTIONS = [
    { label: '业务字典', value: 'BUSINESS' },
    { label: '系统字典', value: 'SYSTEM' },
];

export const STATUS_OPTIONS = [
    { label: '启用', value: 1 },
    { label: '停用', value: 0 },
];

export const SYSTEM_FLAG_LABEL: Record<string, string> = {
    SYSTEM: '系统字典',
    BUSINESS: '业务字典',
};

export const dictItemColumns: TableColumn<IDictData>[] = [
    { accessorKey: 'dictLabel', header: '字典标签' },
    { accessorKey: 'dictValue', header: '字典值' },
    { accessorKey: 'dictDesc', header: '字典描述' },
    { accessorKey: 'dictSort', header: '排序' },
    { accessorKey: 'status', header: '状态' },
    { accessorKey: 'dictRemark', header: '备注' },
    { accessorKey: 'createTime', header: '创建时间' },
    { id: 'actions', header: '操作' },
];
