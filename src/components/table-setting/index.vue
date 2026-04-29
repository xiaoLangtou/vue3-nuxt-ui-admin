<template>
    <custom-drawer v-model:open="visible" :ui="{
        content: 'max-w-[600px]',
        footer: 'flex items-center justify-end gap-3 p-4 sm:px-6 border-t border-gray-200'
    }" :overlay="false" title="表格设置" @confirm="handleConfirm" @cancel="handleCancel">

        <!-- 基础设置区域 -->
        <div class="space-y-5">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="h-5 w-1 rounded-full bg-primary-500"></div>
                    <h3 class="text-base font-semibold text-gray-900">基础设置</h3>
                </div>
                <UButton
                    :color="applyGlobal ? 'primary' : 'gray'"
                    :variant="applyGlobal ? 'solid' : 'outline'"
                    size="xs"
                    @click="applyGlobal = !applyGlobal">
                    <template #leading>
                        <UIcon :name="applyGlobal ? 'i-heroicons-check-circle' : 'i-heroicons-globe-alt'" />
                    </template>
                    {{ applyGlobal ? '已应用到全局' : '应用到全局' }}
                </UButton>
            </div>

            <div class="space-y-5">
                <!-- 数据列固定 -->
                <div class="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-gray-900">表格数据列固定</label>
                        <span class="text-xs text-gray-500">设置表格左侧列的固定方式</span>
                    </div>
                    <URadioGroup v-model="columnPinning.left" :items="columnsFixedMap" :ui="{ fieldset: 'flex gap-3' }"
                         orientation="horizontal" />
                </div>

                <!-- 操作列固定 -->
                <div class="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-gray-900">表格操作列固定</label>
                        <span class="text-xs text-gray-500">固定操作列在表格右侧</span>
                    </div>
                    <URadioGroup v-model="columnPinning.right" :items="columnsAction" :ui="{ fieldset: 'flex gap-3' }"
                         orientation="horizontal" />
                </div>
                <!-- 头部高亮 -->
                <div class="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-gray-900">头部高亮</label>
                        <span class="text-xs text-gray-500">是否高亮显示表格头部</span>
                    </div>
                    <URadioGroup v-model="headerHighlight" :items="toggleOptions" :ui="{ fieldset: 'flex gap-3' }"
                        orientation="horizontal" />
                </div>

                <!-- 斑马纹 -->
                <div class="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-gray-900">斑马纹</label>
                        <span class="text-xs text-gray-500">是否显示表格斑马纹样式</span>
                    </div>
                    <URadioGroup v-model="showStriped" :items="toggleOptions" :ui="{ fieldset: 'flex gap-3' }"
                        orientation="horizontal" />
                </div>

                <!-- 行悬停效果 -->
                <div class="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-gray-900">行悬停效果</label>
                        <span class="text-xs text-gray-500">鼠标移入行时显示背景色</span>
                    </div>
                    <URadioGroup v-model="rowHover" :items="toggleOptions" :ui="{ fieldset: 'flex gap-3' }"
                        orientation="horizontal" />
                </div>
            </div>
        </div>

        <!-- 自定义显示列区域 -->
        <div class="space-y-5 mt-8">
            <div class="flex items-center gap-2">
                <div class="h-5 w-1 rounded-full"></div>
                <h3 class="text-base font-semibold text-gray-900">自定义显示列</h3>
            </div>

            <UInput v-model="searchQuery" class="w-full" color="gray" icon="i-heroicons-magnifying-glass"
                placeholder="搜索列名..." size="lg" variant="outline" />

            <!-- 拖拽排序列表 -->
            <div class="mt-2">
                <VueDraggable v-model="filteredColumns" :animation="200" class="space-y-2" ghost-class="ghost"
                    handle=".drag-handle" @end="handleDragEnd">
                    <template #item="{ element: column }">
                        <div
                            class="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-primary-300 hover:shadow-sm">
                            <!-- 拖拽手柄 -->
                            <div class="drag-handle cursor-move text-gray-400 transition-colors hover:text-primary-500">
                                <UIcon name="i-heroicons-bars-3" class="h-5 w-5" />
                            </div>

                            <!-- 复选框 -->
                            <UCheckbox v-model="column.checked" :label="column.label" class="flex-1"
                                @update:model-value="handleColumnVisibilityChange(column)" />
                        </div>
                    </template>
                </VueDraggable>

                <!-- 空状态 -->
                <div v-if="filteredColumns.length === 0" class="py-8 text-center text-sm text-gray-500">
                    <UIcon name="i-heroicons-magnifying-glass" class="mx-auto mb-2 h-8 w-8 text-gray-400" />
                    <p>未找到匹配的列</p>
                </div>
            </div>
        </div>
    </custom-drawer>
</template>

<script lang="ts" setup>
import VueDraggable from 'vuedraggable'


interface Props {
    tableRef?: any
}

interface ColumnPinning {
    left: string
    right: string
}

const props = withDefaults(defineProps<Props>(), {
    tableRef: null
})

const emit = defineEmits(['confirm', 'cancel'])

const visible = ref<boolean>(false)
const columns = ref<Record<string, any>[]>([])
const searchQuery = ref<string>('')
const columnPinning = ref<ColumnPinning>({
    left: 'none',
    right: ''
})
const headerHighlight = ref<boolean>(false)
const showStriped = ref<boolean>(false)
const rowHover = ref<boolean>(true)
const applyGlobal = ref<boolean>(false)

// 可以通过 props.tableRef 访问表格实例
watch(() => props.tableRef, (newRef: any) => {
    if (newRef) {
        const _columns = props.tableRef?.tableApi?.getAllColumns().filter((column: any) => column.getCanHide()).map((column: any) => ({
            label: column.columnDef.header,
            value: column.id,
            checked: column.getIsVisible(),
        }))

        columns.value = _columns

    } else {
        columns.value = []
    }
})



const columnsFixedMap = ref<Record<string, string>[]>([
    { label: '不固定', value: 'none' },
    { label: '固定第一列', value: 'firstFixed' },
    { label: '固定前两列', value: 'firstTwoFixed' },
])

const columnsAction = ref<Record<string, string>[]>([
    {
        label: '固定操作列',
        value: 'actionFixed'
    },
])

const toggleOptions = ref<Record<string, any>[]>([
    { label: '显示', value: true },
    { label: '隐藏', value: false }
])

// 过滤后的列
const filteredColumns = computed({
    get: () => {
        if (!searchQuery.value.trim()) {
            return columns.value
        }
        return columns.value.filter((column: typeof columns.value[0]) =>
            column.label.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    },
    set: (value: typeof columns.value) => {
        columns.value = value
    }
})

// 处理列可见性变化
const handleColumnVisibilityChange = (column: typeof columns.value[0]) => {
    if (props.tableRef?.tableApi) {
        const tableColumn = props.tableRef.tableApi.getColumn(column.value)
        if (tableColumn) {
            tableColumn.toggleVisibility(column.checked)
        }
    }
}


const handleConfirm = () => {
    const _columnPinning = {
        left: [] as string[],
        right: [] as string[]
    }

    if (columnPinning.value.left === 'firstFixed' && columns.value.length > 0) {
        _columnPinning.left.push(columns.value[0].value)
    }

    if (columnPinning.value.left === 'firstTwoFixed' && columns.value.length > 1) {
        _columnPinning.left.push(columns.value[0].value)
        _columnPinning.left.push(columns.value[1].value)
    }

    if (columnPinning.value.right === 'actionFixed' && columns.value.length > 0) {
        const lastColumn = columns.value[columns.value.length - 1]
        if (lastColumn.value === 'action') {
            _columnPinning.right.push(lastColumn.value)
        }
    }

    emit('confirm', {
        columnPinning: _columnPinning,
        headerHighlight: headerHighlight.value,
        showStriped: showStriped.value,
        rowHover: rowHover.value,
        applyGlobal: applyGlobal.value
    })
    visible.value = false
}

const handleCancel = () => {
    visible.value = false
    emit('cancel')
}

const open = () => {
    visible.value = true
}

defineExpose({
    open
})


// 处理拖拽结束
const handleDragEnd = () => {
    // 拖拽结束后可以触发列顺序更新
    // 这里可以添加更新表格列顺序的逻辑
    if (props.tableRef?.tableApi) {

    }
}


</script>
