<script setup lang="ts">
import type { RouteLocationAsRelativeGeneric, RouteLocationAsPathGeneric } from 'vue-router'

interface Props {
  page?: number
  total?: number
  itemsPerPage?: number
  pageSizeOptions?: number[]
  showTotal?: boolean
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  disabled?: boolean
  color?: 'neutral' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'
  variant?: 'outline' | 'solid' | 'soft' | 'subtle' | 'ghost' | 'link'
  activeColor?: 'neutral' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'
  activeVariant?: 'outline' | 'solid' | 'soft' | 'subtle' | 'ghost' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showControls?: boolean
  showEdges?: boolean
  siblingCount?: number
  totalText?: string | ((range: { start: number; end: number; total: number }) => string)
  as?: any
  firstIcon?: any
  prevIcon?: any
  nextIcon?: any
  lastIcon?: any
  ellipsisIcon?: any
  to?: ((page: number) => string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric | undefined) | undefined
  ui?: {
    root?: any
    list?: any
    ellipsis?: any
    label?: any
    first?: any
    prev?: any
    item?: any
    next?: any
    last?: any
  }
  defaultPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  page: 1,
  total: 0,
  itemsPerPage: 10,
  pageSizeOptions: () => [10, 20, 50, 100],
  showTotal: true,
  showSizeChanger: true,
  showQuickJumper: true,
  disabled: false,
  color: 'neutral',
  variant: 'outline',
  activeColor: 'primary',
  activeVariant: 'solid',
  size: 'md',
  showControls: true,
  showEdges: false,
  siblingCount: 2,
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:itemsPerPage': [size: number]
  'pageChange': [page: number]
  'sizeChange': [size: number]
}>()

const currentPage = computed({
  get: () => props.page,
  set: (value) => {
    emit('update:page', value)
    emit('pageChange', value)
  },
})

const currentSize = computed({
  get: () => props.itemsPerPage,
  set: (value) => {
    emit('update:itemsPerPage', value)
    emit('sizeChange', value)
  },
})

const totalPages = computed(() => Math.ceil(props.total / props.itemsPerPage))

const jumpPage = ref<number | string>('')

const sizeOptions = computed(() => {
  return props.pageSizeOptions.map(size => ({
    label: `${size} 条/页`,
    value: size,
  }))
})

const handleSizeChange = (size: number) => {
  currentSize.value = size
  if (currentPage.value > Math.ceil(props.total / size)) {
    currentPage.value = 1
  }
}

const handleJump = () => {
  const page = Number(jumpPage.value)
  if (page && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    jumpPage.value = ''
  }
}

const handleJumpKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleJump()
  }
}

const startItem = computed(() => {
  if (props.total === 0) return 0
  return (currentPage.value - 1) * props.itemsPerPage + 1
})

const endItem = computed(() => {
  const end = currentPage.value * props.itemsPerPage
  return end > props.total ? props.total : end
})

const totalDisplayText = computed(() => {
  if (!props.totalText) {
    return `显示 ${startItem.value} 到 ${endItem.value} 条，共 ${props.total} 条`
  }
  
  if (typeof props.totalText === 'function') {
    return props.totalText({
      start: startItem.value,
      end: endItem.value,
      total: props.total,
    })
  }
  
  return props.totalText
})

const paginationProps = computed(() => {
  const { 
    pageSizeOptions, 
    showTotal, 
    showSizeChanger, 
    showQuickJumper, 
    totalText,
    ...rest 
  } = props
  
  return rest
})
</script>

<template>
  <div class="flex items-center justify-between gap-4 flex-wrap">
    <!-- 左侧：总条数显示 -->
    <div v-if="showTotal" class="text-sm text-gray-600 dark:text-gray-400">
      <template v-if="!totalText">
        显示 <span class="font-medium text-gray-900 dark:text-gray-100">{{ startItem }}</span> 到 
        <span class="font-medium text-gray-900 dark:text-gray-100">{{ endItem }}</span> 条，
        共 <span class="font-medium text-gray-900 dark:text-gray-100">{{ total }}</span> 条
      </template>
      <template v-else>
        {{ totalDisplayText }}
      </template>
    </div>

    <!-- 右侧：分页器 + 分页大小选择器 + 快速跳转 -->
    <div class="flex items-center gap-3">
      <UPagination
        v-model:page="currentPage"
        v-bind="paginationProps"
      />

      <!-- 分页大小选择器 -->
      <USelect
        v-if="showSizeChanger"
        :model-value="currentSize"
        :items="sizeOptions"
        :size="size"
        :disabled="disabled"
        class="w-32"
        @update:model-value="handleSizeChange"
      />

      <!-- 快速跳转 -->
      <div v-if="showQuickJumper" class="flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">跳至</span>
        <UInput
          v-model="jumpPage"
          type="number"
          :size="size"
          :disabled="disabled"
          :min="1"
          :max="totalPages"
          placeholder="页码"
          class="w-20"
          @keydown="handleJumpKeydown"
        />
        <span class="text-sm text-gray-600 dark:text-gray-400">页</span>
        <UButton
          :size="size"
          :disabled="disabled || !jumpPage"
          color="primary"
          variant="outline"
          @click="handleJump"
        >
          跳转
        </UButton>
      </div>
    </div>
  </div>
</template>
