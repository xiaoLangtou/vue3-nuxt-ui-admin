<script lang="ts" setup>
import { gray_COLORS, PRIMARY_COLORS } from '@/preferences/colors';
import globalToast from '@/services/core/toast.ts';
import { useLayoutStore } from '@/stores/layout';
import { useClipboard } from '@vueuse/core';
import { storeToRefs } from 'pinia';

// 定义组件属性
interface Props {
    visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

// 定义组件事件
const emit = defineEmits<{
    'update:visible': [value: boolean];
}>();

const isOpen = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value),
});

const layoutStore = useLayoutStore();
const { layoutConfig, isShowTab, tabStyle, isShowIcon, isShowHeader, isShowFooter, companyName, companyHomepage, date, icp, icpLink, isEnableColorWeak, isEnableGray } = storeToRefs(layoutStore);
const appConfig = useAppConfig();

// 使用 VueUse 的 useClipboard
const { copy, copied } = useClipboard();

/**
 * 布局模式类型
 */
type LayoutMode = 'sidebar' | 'topbar';

/**
 * 类型守卫：检查是否为有效的布局模式
 */
const isValidLayoutMode = (mode: unknown): mode is LayoutMode => {
    return mode === 'sidebar' || mode === 'topbar';
};

const layoutMode = ref<LayoutMode>(isValidLayoutMode(layoutConfig.value.layoutMode) ? layoutConfig.value.layoutMode : 'sidebar');
const layoutModeOptions = ref([
    { label: 'Static', value: 'sidebar' },
    { label: 'Horizontal', value: 'topbar' },
]);

function onLayoutModeChange() {
    layoutConfig.value.layoutMode = layoutMode.value;
}

// 复制配置功能
async function handleConfirm() {
    const configString = layoutStore.generateConfigString(layoutConfig.value);
    await copy(configString);

    if (copied.value) {
        globalToast.success('复制成功，请在项目下的【src/preferences/config.ts】文件内进行覆盖', '复制成功');
        // 这里可以添加成功提示，比如使用 toast 组件
    }
    else {
        globalToast.error('复制失败');
    }
}

// 颜色配置
const colors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone'];

function getColorHex(name: string, shade: number) {
    const realName = name === 'old-neutral' ? 'neutral' : name;
    const allColors = [...PRIMARY_COLORS, ...gray_COLORS];
    const color = allColors.find(c => c.name === realName);
    if (color && color.palette && (color.palette as any)[shade]) {
        return (color.palette as any)[shade];
    }
    return 'transparent';
}
</script>

<template>
    <USlideover v-model:open="isOpen" title="系统配置" description="自定义偏好设置 & 实时预览" :ui="{

        overlay: ['bg-neutral-900/50 dark:bg-neutral-950/50', 'backdrop-blur-sm'],
        content: ['w-[500px]', 'max-w-[800px]'],
        zIndex: 'z-[1000]',
        footer: ['p-4']
    }">
        <template #body>
            <div class="space-y-8 py-2">
                <!-- 主题颜色 -->
                <div class="flex gap-4 flex-col">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <div
                            class="p-1.5 rounded-lg bg-primary-100/50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                            <UIcon name="i-lucide-palette" class="w-4 h-4" />
                        </div>
                        主题风格
                    </h3>

                    <div class="space-y-6">
                        <div
                            class="bg-neutral-50/50 dark:bg-neutral-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-200">主色调</span>
                                <span class="text-xs text-gray-500">{{ appConfig.ui.colors.primary }}</span>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <UTooltip v-for="color in colors" :key="color" :text="color"
                                    :popper="{ placement: 'top' }">
                                    <button
                                        class="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none ring-2 ring-transparent"
                                        :class="[
                                            appConfig.ui.colors.primary === color
                                                ? 'ring-primary-500 dark:ring-primary-400 scale-110 shadow-sm'
                                                : 'hover:scale-110 hover:shadow-sm'
                                        ]" :style="{ backgroundColor: `var(--color-${color}-500)` }"
                                        @click="appConfig.ui.colors.primary = color">
                                        <UIcon v-if="appConfig.ui.colors.primary === color" name="i-lucide-check"
                                            class="w-3.5 h-3.5 text-white" />
                                    </button>
                                </UTooltip>
                            </div>
                        </div>

                        <div
                            class="bg-neutral-50/50 dark:bg-neutral-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-200">中性色</span>
                                <span class="text-xs text-gray-500">{{ appConfig.ui.colors.neutral }}</span>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <UTooltip v-for="color in neutrals" :key="color" :text="color"
                                    :popper="{ placement: 'top' }">
                                    <button
                                        class="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none ring-2 ring-transparent"
                                        :class="[
                                            (appConfig.ui.colors.neutral === color || (appConfig.ui.colors.neutral === 'neutral' && color === 'neutral'))
                                                ? 'ring-gray-400 dark:ring-gray-500 scale-110 shadow-sm'
                                                : 'hover:scale-110 hover:shadow-sm'
                                        ]" :style="{ backgroundColor: getColorHex(color, 500) }"
                                        @click="appConfig.ui.colors.neutral = color">
                                        <UIcon
                                            v-if="appConfig.ui.colors.neutral === color || (appConfig.ui.colors.neutral === 'neutral' && color === 'neutral')"
                                            name="i-lucide-check" class="w-3.5 h-3.5 text-white" />
                                    </button>
                                </UTooltip>
                            </div>
                        </div>
                    </div>
                </div>

                <UDivider />

                <!-- 布局模式 -->
                <div class="flex gap-4 flex-col">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <div
                            class="p-1.5 rounded-lg bg-primary-100/50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                            <UIcon name="i-lucide-layout" class="w-4 h-4" />
                        </div>
                        布局模式
                    </h3>

                    <div class="grid grid-cols-2 gap-4">
                        <div v-for="option in layoutModeOptions" :key="option.value"
                            class="cursor-pointer group relative rounded-xl border-2 transition-all duration-200 overflow-hidden"
                            :class="[
                                layoutMode === option.value
                                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 shadow-sm'
                                    : 'border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 bg-white dark:bg-neutral-900',
                            ]" @click="() => {
                                layoutMode = option.value as 'sidebar' | 'topbar';
                                onLayoutModeChange();
                            }">
                            <div class="p-3">
                                <div
                                    class="aspect-[16/10] w-full rounded-lg bg-neutral-50 dark:bg-neutral-800/50 overflow-hidden relative border border-gray-100 dark:border-gray-700/50">
                                    <!-- Sidebar Layout Preview -->
                                    <div v-if="option.value === 'sidebar'" class="flex h-full w-full">
                                        <div
                                            class="w-[28%] h-full bg-white dark:bg-neutral-800 border-r border-gray-100 dark:border-gray-700/50 flex flex-col gap-1.5 p-1.5">
                                            <div class="w-3/4 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                                            <div
                                                class="w-full h-1.5 bg-neutral-100 dark:bg-neutral-700/50 rounded-full mt-1" />
                                            <div class="w-5/6 h-1.5 bg-neutral-100 dark:bg-neutral-700/50 rounded-full" />
                                        </div>
                                        <div class="flex-1 flex flex-col h-full">
                                            <div
                                                class="h-3 w-full bg-white dark:bg-neutral-800 border-b border-gray-100 dark:border-gray-700/50" />
                                            <div class="flex-1 p-1.5">
                                                <div
                                                    class="w-full h-full bg-white dark:bg-neutral-800 rounded border border-dashed border-gray-200 dark:border-gray-700/50" />
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Topbar Layout Preview -->
                                    <div v-else class="flex flex-col h-full w-full">
                                        <div
                                            class="h-8 w-full bg-white dark:bg-neutral-800 border-b border-gray-100 dark:border-gray-700/50 flex flex-col">
                                            <div class="flex-1 flex items-center gap-2 px-2">
                                                <div class="w-4 h-4 rounded-full bg-neutral-100 dark:bg-neutral-700" />
                                                <div class="w-12 h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full" />
                                            </div>
                                            <div class="h-[1px] bg-neutral-50 dark:bg-neutral-800" />
                                        </div>
                                        <div class="flex-1 p-1.5">
                                            <div
                                                class="w-full h-full bg-white dark:bg-neutral-800 rounded border border-dashed border-gray-200 dark:border-gray-700/50" />
                                        </div>
                                    </div>

                                    <!-- Selected Badge -->
                                    <div v-if="layoutMode === option.value" class="absolute top-1.5 right-1.5">
                                        <div class="bg-primary-500 text-white rounded-full p-0.5 shadow-sm">
                                            <UIcon name="i-lucide-check" class="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-2.5 flex items-center justify-between">
                                    <span class="text-sm font-medium"
                                        :class="layoutMode === option.value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'">
                                        {{ option.label }}
                                    </span>
                                    <UIcon v-if="layoutMode === option.value" name="i-lucide-check-circle-2"
                                        class="w-4 h-4 text-primary-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <UDivider />

                <!-- 界面显示 -->
                <div class="flex gap-4 flex-col">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <div
                            class="p-1.5 rounded-lg bg-primary-100/50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                            <UIcon name="i-lucide-app-window" class="w-4 h-4" />
                        </div>
                        界面显示
                    </h3>

                    <div
                        class="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                        <!-- Header -->
                        <div
                            class="p-3 flex items-center justify-between hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                            <div class="flex flex-col gap-0.5">
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-200">顶栏</span>
                                <span class="text-xs text-gray-500">顶部导航栏和工具栏</span>
                            </div>
                            <USwitch v-model="isShowHeader" color="primary" />
                        </div>

                        <!-- Tabs -->
                        <div class="p-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                            <div class="flex items-center justify-between">
                                <div class="flex flex-col gap-0.5">
                                    <span class="text-sm font-medium text-gray-700 dark:text-gray-200">标签栏</span>
                                    <span class="text-xs text-gray-500">多标签页导航</span>
                                </div>
                                <USwitch v-model="isShowTab" color="primary" />
                            </div>

                            <div v-if="isShowTab"
                                class="mt-3 pl-1 pt-3 border-t border-gray-100 dark:border-gray-800/50 grid grid-cols-2 gap-4">
                                <div class="space-y-1.5">
                                    <span class="text-xs font-medium text-gray-500">样式风格</span>
                                    <USelectMenu v-model="tabStyle" :options="[
                                        { label: '卡片风格', value: 'Card', icon: 'i-lucide-credit-card' },
                                        { label: '极简方形', value: 'Square', icon: 'i-lucide-square' },
                                    ]" option-attribute="label" value-attribute="value" size="sm" class="w-full" />
                                </div>
                                <div class="space-y-1.5">
                                    <span class="text-xs font-medium text-gray-500">显示图标</span>
                                    <div
                                        class="flex items-center justify-between h-[32px] px-3 bg-neutral-50 dark:bg-neutral-800 rounded-md border border-gray-200 dark:border-gray-700">
                                        <span class="text-xs text-gray-600 dark:text-gray-400">图标开关</span>
                                        <USwitch v-model="isShowIcon" size="xs" color="primary" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="p-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                            <div class="flex items-center justify-between">
                                <div class="flex flex-col gap-0.5">
                                    <span class="text-sm font-medium text-gray-700 dark:text-gray-200">页脚</span>
                                    <span class="text-xs text-gray-500">底部版权和备案信息</span>
                                </div>
                                <USwitch v-model="isShowFooter" color="primary" />
                            </div>

                            <div v-if="isShowFooter"
                                class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/50 space-y-3">
                                <div class="grid grid-cols-2 gap-3">
                                    <UInput v-model="companyName" size="sm" placeholder="公司名称" icon="i-lucide-building"
                                        :ui="{ icon: { trailing: { pointer: '' } } }" />
                                    <UInput v-model="companyHomepage" size="sm" placeholder="公司主页"
                                        icon="i-lucide-link" />
                                </div>
                                <div class="grid grid-cols-2 gap-3">
                                    <UInput v-model="date" size="sm" placeholder="日期" icon="i-lucide-calendar" />
                                    <UInput v-model="icp" size="sm" placeholder="ICP备案" icon="i-lucide-shield-check" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <UDivider />

                <!-- 其他设置 -->
                <div class="flex gap-4 flex-col">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <UIcon name="i-lucide-settings-2" class="w-5 h-5 text-primary-500" />
                        其他设置
                    </h3>

                    <div class="grid grid-cols-2 gap-3">
                        <div
                            class="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary-500/50 transition-colors bg-white dark:bg-neutral-900">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <UIcon name="i-lucide-eye" class="w-4 h-4 text-gray-500" />
                                    <span class="text-sm font-medium text-gray-700 dark:text-gray-200">色弱模式</span>
                                </div>
                                <USwitch v-model="isEnableColorWeak" color="primary" />
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">增强颜色的辨识度</p>
                        </div>

                        <div
                            class="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary-500/50 transition-colors bg-white dark:bg-neutral-900">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <UIcon name="i-lucide-monitor-off" class="w-4 h-4 text-gray-500" />
                                    <span class="text-sm font-medium text-gray-700 dark:text-gray-200">灰色模式</span>
                                </div>
                                <USwitch v-model="isEnableGray" color="primary" />
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">全站置灰，用于哀悼日</p>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <template #footer>
            <UButton block label="复制偏好配置" icon="i-lucide-copy" color="primary" @click="handleConfirm" />
        </template>
    </USlideover>
</template>
