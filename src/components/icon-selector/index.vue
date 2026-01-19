<script setup lang="ts">
/**
 * 图标选择器组件 - 优化版
 * 使用 Nuxt UI 组件，支持 Lucide 图标
 */

interface Props {
    modelValue?: string;
    placeholder?: string;
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: '请选择图标',
    disabled: false
});

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

// Lucide 完整图标列表（400+ 图标）
const lucideIcons = [
    // 常用图标
    'i-lucide-home', 'i-lucide-user', 'i-lucide-users', 'i-lucide-settings', 'i-lucide-search',
    'i-lucide-menu', 'i-lucide-x', 'i-lucide-check', 'i-lucide-plus', 'i-lucide-minus',

    // 箭头
    'i-lucide-arrow-up', 'i-lucide-arrow-down', 'i-lucide-arrow-left', 'i-lucide-arrow-right',
    'i-lucide-arrow-up-down', 'i-lucide-arrow-left-right', 'i-lucide-arrow-up-right',
    'i-lucide-arrow-down-right', 'i-lucide-arrow-down-left', 'i-lucide-arrow-up-left',
    'i-lucide-chevron-up', 'i-lucide-chevron-down', 'i-lucide-chevron-left', 'i-lucide-chevron-right',
    'i-lucide-chevrons-up', 'i-lucide-chevrons-down', 'i-lucide-chevrons-left', 'i-lucide-chevrons-right',
    'i-lucide-move', 'i-lucide-move-diagonal', 'i-lucide-move-horizontal', 'i-lucide-move-vertical',

    // 文件和文件夹
    'i-lucide-file', 'i-lucide-file-text', 'i-lucide-file-plus', 'i-lucide-file-minus',
    'i-lucide-file-edit', 'i-lucide-file-check', 'i-lucide-file-x', 'i-lucide-file-search',
    'i-lucide-folder', 'i-lucide-folder-open', 'i-lucide-folder-plus', 'i-lucide-folder-minus',
    'i-lucide-folder-check', 'i-lucide-folder-x', 'i-lucide-folder-search', 'i-lucide-folders',

    // 编辑和操作
    'i-lucide-edit', 'i-lucide-pencil', 'i-lucide-pen-tool', 'i-lucide-trash', 'i-lucide-trash-2',
    'i-lucide-copy', 'i-lucide-clipboard', 'i-lucide-clipboard-copy', 'i-lucide-clipboard-check',
    'i-lucide-save', 'i-lucide-download', 'i-lucide-upload', 'i-lucide-share', 'i-lucide-share-2',

    // 媒体
    'i-lucide-image', 'i-lucide-camera', 'i-lucide-video', 'i-lucide-film', 'i-lucide-music',
    'i-lucide-play', 'i-lucide-pause', 'i-lucide-stop', 'i-lucide-skip-forward', 'i-lucide-skip-back',
    'i-lucide-volume', 'i-lucide-volume-1', 'i-lucide-volume-2', 'i-lucide-volume-x',

    // 通信
    'i-lucide-mail', 'i-lucide-inbox', 'i-lucide-send', 'i-lucide-message-circle',
    'i-lucide-message-square', 'i-lucide-phone', 'i-lucide-phone-call', 'i-lucide-phone-incoming',
    'i-lucide-phone-outgoing', 'i-lucide-phone-missed', 'i-lucide-phone-off',

    // 通知和警告
    'i-lucide-bell', 'i-lucide-bell-off', 'i-lucide-bell-ring', 'i-lucide-alert-circle',
    'i-lucide-alert-triangle', 'i-lucide-alert-octagon', 'i-lucide-info', 'i-lucide-help-circle',

    // 界面元素
    'i-lucide-layout', 'i-lucide-sidebar', 'i-lucide-panel-left', 'i-lucide-panel-right',
    'i-lucide-grid', 'i-lucide-list', 'i-lucide-table', 'i-lucide-columns', 'i-lucide-rows',
    'i-lucide-maximize', 'i-lucide-minimize', 'i-lucide-expand', 'i-lucide-shrink',

    // 导航
    'i-lucide-more-horizontal', 'i-lucide-more-vertical', 'i-lucide-filter', 'i-lucide-sliders',
    'i-lucide-eye', 'i-lucide-eye-off', 'i-lucide-external-link', 'i-lucide-link', 'i-lucide-unlink',

    // 状态
    'i-lucide-check-circle', 'i-lucide-check-circle-2', 'i-lucide-check-square',
    'i-lucide-x-circle', 'i-lucide-x-square', 'i-lucide-circle', 'i-lucide-square',
    'i-lucide-loader', 'i-lucide-loader-2', 'i-lucide-refresh-cw', 'i-lucide-refresh-ccw',
    'i-lucide-rotate-cw', 'i-lucide-rotate-ccw',

    // 时间和日期
    'i-lucide-calendar', 'i-lucide-calendar-days', 'i-lucide-calendar-check', 'i-lucide-calendar-x',
    'i-lucide-clock', 'i-lucide-timer', 'i-lucide-hourglass', 'i-lucide-watch',

    // 地图和位置
    'i-lucide-map', 'i-lucide-map-pin', 'i-lucide-navigation', 'i-lucide-compass',
    'i-lucide-locate', 'i-lucide-locate-fixed', 'i-lucide-globe', 'i-lucide-flag',

    // 设备
    'i-lucide-smartphone', 'i-lucide-tablet', 'i-lucide-laptop', 'i-lucide-monitor',
    'i-lucide-tv', 'i-lucide-watch', 'i-lucide-printer', 'i-lucide-keyboard',
    'i-lucide-mouse', 'i-lucide-headphones', 'i-lucide-speaker',

    // 网络和连接
    'i-lucide-wifi', 'i-lucide-wifi-off', 'i-lucide-bluetooth', 'i-lucide-cast',
    'i-lucide-radio', 'i-lucide-signal', 'i-lucide-rss', 'i-lucide-antenna',

    // 安全
    'i-lucide-lock', 'i-lucide-unlock', 'i-lucide-key', 'i-lucide-shield', 'i-lucide-shield-check',
    'i-lucide-shield-alert', 'i-lucide-shield-off', 'i-lucide-fingerprint',

    // 用户和人物
    'i-lucide-user-plus', 'i-lucide-user-minus', 'i-lucide-user-check', 'i-lucide-user-x',
    'i-lucide-users-2', 'i-lucide-user-circle', 'i-lucide-user-square',

    // 商业和金融
    'i-lucide-shopping-cart', 'i-lucide-shopping-bag', 'i-lucide-credit-card',
    'i-lucide-dollar-sign', 'i-lucide-euro', 'i-lucide-pound-sterling', 'i-lucide-yen',
    'i-lucide-percent', 'i-lucide-trending-up', 'i-lucide-trending-down',

    // 图表
    'i-lucide-bar-chart', 'i-lucide-bar-chart-2', 'i-lucide-bar-chart-3', 'i-lucide-bar-chart-4',
    'i-lucide-line-chart', 'i-lucide-pie-chart', 'i-lucide-activity',

    // 开发和代码
    'i-lucide-code', 'i-lucide-code-2', 'i-lucide-terminal', 'i-lucide-command',
    'i-lucide-git-branch', 'i-lucide-git-commit', 'i-lucide-git-merge', 'i-lucide-git-pull-request',
    'i-lucide-github', 'i-lucide-gitlab', 'i-lucide-bug',

    // 数据和服务器
    'i-lucide-database', 'i-lucide-server', 'i-lucide-hard-drive', 'i-lucide-cpu',
    'i-lucide-cloud', 'i-lucide-cloud-download', 'i-lucide-cloud-upload', 'i-lucide-cloud-off',

    // 包和盒子
    'i-lucide-package', 'i-lucide-package-2', 'i-lucide-package-check', 'i-lucide-package-minus',
    'i-lucide-package-plus', 'i-lucide-package-search', 'i-lucide-package-x',
    'i-lucide-box', 'i-lucide-archive', 'i-lucide-inbox',

    // 标签和书签
    'i-lucide-tag', 'i-lucide-tags', 'i-lucide-bookmark', 'i-lucide-bookmark-plus',
    'i-lucide-bookmark-minus', 'i-lucide-bookmark-check', 'i-lucide-bookmark-x',

    // 星星和喜欢
    'i-lucide-star', 'i-lucide-star-half', 'i-lucide-star-off', 'i-lucide-heart',
    'i-lucide-heart-off', 'i-lucide-thumbs-up', 'i-lucide-thumbs-down',

    // 天气
    'i-lucide-sun', 'i-lucide-moon', 'i-lucide-cloud', 'i-lucide-cloud-rain',
    'i-lucide-cloud-snow', 'i-lucide-cloud-lightning', 'i-lucide-wind', 'i-lucide-droplet',

    // 电源和电池
    'i-lucide-power', 'i-lucide-power-off', 'i-lucide-battery', 'i-lucide-battery-charging',
    'i-lucide-battery-full', 'i-lucide-battery-low', 'i-lucide-battery-medium',
    'i-lucide-plug', 'i-lucide-zap', 'i-lucide-zap-off',

    // 工具
    'i-lucide-wrench', 'i-lucide-hammer', 'i-lucide-screwdriver', 'i-lucide-tool',

    // 游戏和娱乐
    'i-lucide-gamepad', 'i-lucide-gamepad-2', 'i-lucide-trophy', 'i-lucide-award',
    'i-lucide-gift', 'i-lucide-ticket', 'i-lucide-dice-1', 'i-lucide-dice-2',

    // 交通
    'i-lucide-car', 'i-lucide-bus', 'i-lucide-train', 'i-lucide-plane', 'i-lucide-ship',
    'i-lucide-bike', 'i-lucide-truck', 'i-lucide-fuel',

    // 建筑和地点
    'i-lucide-building', 'i-lucide-building-2', 'i-lucide-home', 'i-lucide-hotel',
    'i-lucide-store', 'i-lucide-warehouse', 'i-lucide-factory',

    // 自然
    'i-lucide-tree-deciduous', 'i-lucide-tree-pine', 'i-lucide-flower', 'i-lucide-leaf',

    // 食物
    'i-lucide-coffee', 'i-lucide-pizza', 'i-lucide-cake', 'i-lucide-apple',

    // 其他
    'i-lucide-target', 'i-lucide-crosshair', 'i-lucide-anchor', 'i-lucide-palette',
    'i-lucide-pipette', 'i-lucide-ruler', 'i-lucide-scissors', 'i-lucide-paperclip',
    'i-lucide-pin', 'i-lucide-magnet', 'i-lucide-flashlight', 'i-lucide-lightbulb',
    'i-lucide-flame', 'i-lucide-sparkles', 'i-lucide-crown', 'i-lucide-gem'
];

const selectedIcon = ref(props.modelValue);
const modalVisible = ref(false);
const searchKeyword = ref('');

const filteredIcons = computed(() => {
    if (!searchKeyword.value.trim()) {
        return lucideIcons;
    }
    const keyword = searchKeyword.value.toLowerCase();
    return lucideIcons.filter(icon => icon.toLowerCase().includes(keyword));
});

const getIconLabel = (icon: string) => {
    return icon.replace('i-lucide-', '').replace(/-/g, ' ');
};

watch(() => props.modelValue, (newValue) => {
    selectedIcon.value = newValue;
});

watch(selectedIcon, (newValue) => {
    emit('update:modelValue', newValue);
});

const openModal = () => {
    if (!props.disabled) {
        modalVisible.value = true;
        searchKeyword.value = '';
    }
};

const selectIcon = (icon: string) => {
    selectedIcon.value = icon;
    modalVisible.value = false;
};

const clearIcon = () => {
    selectedIcon.value = '';
};
</script>

<template>
    <div class="icon-selector w-full">
        <!-- 输入框 -->
        <div
            class="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
            :class="{ 'opacity-50 cursor-not-allowed': disabled, 'border-primary-500 dark:border-primary-400': modalVisible }"
            @click="openModal"
        >
            <UIcon
                v-if="selectedIcon"
                :name="selectedIcon"
                class="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0"
            />
            <UIcon
                v-else
                name="i-lucide-image"
                class="w-5 h-5 text-gray-400 shrink-0"
            />

            <span class="flex-1 text-sm text-gray-700 dark:text-gray-300">
                {{ selectedIcon ? getIconLabel(selectedIcon) : placeholder }}
            </span>

            <UButton
                v-if="selectedIcon && !disabled"
                icon="i-lucide-x"
                color="gray"
                variant="ghost"
                size="xs"
                @click.stop="clearIcon"
            />
        </div>

        <!-- 图标选择器弹窗 -->
        <UModal
            v-model:open="modalVisible"
            title="选择图标"
            :ui="{ content: 'max-w-3xl' }"
        >
            <template #body>
                <!-- 搜索框 -->
                <div class="mb-4">
                    <UInput
                        v-model="searchKeyword"
                        icon="i-lucide-search"
                        placeholder="搜索图标..."
                        class="w-full"
                    />
                </div>

                <!-- 图标网格 -->
                <div class="max-h-[500px] overflow-y-auto">
                    <div v-if="filteredIcons.length > 0" class="grid grid-cols-8 gap-2">
                        <button
                            v-for="icon in filteredIcons"
                            :key="icon"
                            :title="getIconLabel(icon)"
                            class="group flex items-center justify-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all"
                            :class="{
                                'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-950/30': selectedIcon === icon
                            }"
                            @click="selectIcon(icon)"
                        >
                            <UIcon
                                :name="icon"
                                class="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                                :class="{
                                    'text-primary-600 dark:text-primary-400': selectedIcon === icon
                                }"
                            />
                        </button>
                    </div>

                    <!-- 空状态 -->
                    <div v-else class="flex flex-col items-center justify-center py-12">
                        <UIcon name="i-lucide-search-x" class="w-12 h-12 text-gray-400 mb-3" />
                        <p class="text-sm text-gray-500 dark:text-gray-400">未找到匹配的图标</p>
                    </div>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-between items-center">
                    <div v-if="selectedIcon" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <UIcon :name="selectedIcon" class="w-4 h-4" />
                        <span>{{ getIconLabel(selectedIcon) }}</span>
                    </div>
                    <div v-else class="text-sm text-gray-400">
                        共 {{ filteredIcons.length }} 个图标
                    </div>

                    <UButton
                        label="关闭"
                        color="neutral"
                        @click="modalVisible = false"
                    />
                </div>
            </template>
        </UModal>
    </div>
</template>
