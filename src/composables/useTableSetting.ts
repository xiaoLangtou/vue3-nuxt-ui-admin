import { StorageUtil } from '@/utils/storage'

/**
 * 表格全局设置接口
 */
interface TableGlobalSettings {
    headerHighlight: boolean
    showStriped: boolean
    rowHover: boolean
}

/**
 * 表格设置配置接口
 */
interface TableSettingConfig {
    columnPinning: {
        left: string[]
        right: string[]
    }
    headerHighlight: boolean
    showStriped: boolean
    rowHover: boolean
    applyGlobal: boolean
}

const TABLE_GLOBAL_SETTINGS_KEY = 'table-global-settings'

/**
 * 表格设置 Hook
 * 用于管理表格列固定、显示/隐藏、头部高亮、斑马纹等设置
 */
export function useTableSetting() {
    const tableSettingRef = ref()
    const columnPinning = ref<{
        left: string[]
        right: string[]
    }>({
        left: [],
        right: []
    })
    const headerHighlight = ref<boolean>(false)
    const showStriped = ref<boolean>(false)
    const rowHover = ref<boolean>(true)
    const applyGlobal = ref<boolean>(false)

    /**
     * 从 StorageUtil 加载全局设置
     */
    const loadGlobalSettings = () => {
        const settings = StorageUtil.get<TableGlobalSettings>(TABLE_GLOBAL_SETTINGS_KEY)
        if (settings) {
            headerHighlight.value = settings.headerHighlight ?? false
            showStriped.value = settings.showStriped ?? false
            rowHover.value = settings.rowHover ?? true
        }
    }

    /**
     * 保存全局设置到 StorageUtil
     */
    const saveGlobalSettings = () => {
        const settings: TableGlobalSettings = {
            headerHighlight: headerHighlight.value,
            showStriped: showStriped.value,
            rowHover: rowHover.value
        }
        StorageUtil.set(TABLE_GLOBAL_SETTINGS_KEY, settings)
    }

    // 初始化时加载全局设置
    loadGlobalSettings()

    const tableUi = computed(() => {
        const baseClasses = 'isolate [&>tr]:data-[selectable=true]:focus-visible:outline-primary'
        const hoverClasses = rowHover.value ? '[&>tr]:hover:bg-gray-100 dark:[&>tr]:hover:bg-gray-800/50' : ''
        const stripedClasses = showStriped.value ? '[&>tr:nth-child(even)]:bg-gray-50 dark:[&>tr:nth-child(even)]:bg-gray-900/50' : ''

        return {
            base: "table-auto w-full",
            thead: headerHighlight.value ? 'bg-primary-50 dark:bg-primary-950' : 'relative',
            tbody: `${baseClasses} ${hoverClasses} ${stripedClasses}`.trim()
        }
    });

    /**
     * 打开表格设置弹窗
     */
    const openTableSetting = () => {
        tableSettingRef.value?.open()
    }

    /**
     * 处理表格设置确认
     */
    const handleTableSettingConfirm = (config: TableSettingConfig) => {
        columnPinning.value = config.columnPinning
        headerHighlight.value = config.headerHighlight
        showStriped.value = config.showStriped
        rowHover.value = config.rowHover
        applyGlobal.value = config.applyGlobal

        // 如果选择应用到全局,保存到 localStorage
        if (config.applyGlobal) {
            saveGlobalSettings()
        }
    }

    return {
        tableSettingRef,
        columnPinning,
        headerHighlight,
        showStriped,
        rowHover,
        applyGlobal,
        tableUi,
        openTableSetting,
        handleTableSettingConfirm
    }
}
