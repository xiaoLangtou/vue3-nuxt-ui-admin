<script setup lang="ts">
import type { FilterConfig, FilterValue } from '@types/search.ts';

interface Props {
    /** 筛选配置 */
    config: FilterConfig;
    /** 当前值 */
    value: FilterValue;
    /** 是否显示错误 */
    showError?: boolean;
    /** 是否立即触发 */
    immediate?: boolean;
}

interface Emits {
    (e: 'update', key: string, value: FilterValue): void;
    (e: 'validate', key: string, valid: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
    showError: false
});

const emit = defineEmits<Emits>();

// 错误状态
const hasError = ref(false);
const errorMessage = ref('');

/**
 * 处理值更新
 * @param newValue 新值
 */
const handleUpdate = (newValue: FilterValue) => {
    // 发送更新事件,是否立即触发
    emit('update', props.config.key, newValue);
};

/**
 * 验证值
 * @param value 要验证的值
 */
const validateValue = (value: FilterValue): { valid: boolean; message: string } => {
    // 必填验证
    if (props.config.required) {
        if (value === null || value === undefined || value === '') {
            return { valid: false, message: `${props.config.label}不能为空` };
        }
        if (Array.isArray(value) && value.length === 0) {
            return { valid: false, message: `${props.config.label}不能为空` };
        }
    }

    // 自定义规则验证
    if (props.config.rules && props.config.rules.length > 0) {
        for (const rule of props.config.rules) {
            if (typeof rule === 'function') {
                const result = rule(value);
                if (result !== true) {
                    return { valid: false, message: result || '验证失败' };
                }
            }
        }
    }

    return { valid: true, message: '' };
};

// Render Component for config.render
const RenderComponent = computed(() => {
    if (!props.config.render) return null;

    return defineComponent({
        name: 'FilterRenderComponent',
        setup() {
            return () => {
                if (props.config.render) {
                    return props.config.render({
                        value: props.value,
                        update: handleUpdate,
                        config: props.config
                    });
                }
                return null;
            };
        }
    });
});

// 暴露验证方法
defineExpose({
    validate: () => {
        const validation = validateValue(props.value);
        hasError.value = !validation.valid;
        errorMessage.value = validation.message;
        return validation.valid;
    },
    clearError: () => {
        hasError.value = false;
        errorMessage.value = '';
    }
});
</script>

<template>
    <div class="filter-item mb-4">
        <div class="flex justify-between items-center mb-2">
            <label v-if="config.label"
                class="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1">
                {{ config.label }}
                <span v-if="config.required" class="text-red-500">*</span>
            </label>
            <UTooltip v-if="config.tooltip" :text="config.tooltip">
                <UIcon name="i-lucide-info" class="w-4 h-4 text-gray-400 cursor-help" />
            </UTooltip>
        </div>

        <div class="relative">
            <component v-if="config.render && RenderComponent" :is="RenderComponent" />

            <!-- Slot Mode -->
            <slot
                v-else-if="config.type === 'slot' && config.slotName"
                :name="config.slotName"
                :value="value"
                :update="handleUpdate"
                :config="config"
            />

            <!-- Select / MultiSelect -->
            <USelectMenu v-else-if="config.type === 'select' || config.type === 'multiSelect'" :model-value="value"
                @update:model-value="handleUpdate" :items="config.options || []" value-attribute="value"
                option-attribute="label" :multiple="config.type === 'multiSelect'"
                :placeholder="config.placeholder || '请选择...'" :color="hasError ? 'red' : 'white'" class="w-full" />

            <!-- Date -->
            <UInput v-else-if="config.type === 'date'" type="date" :model-value="value"
                @update:model-value="handleUpdate" :placeholder="config.placeholder" :color="hasError ? 'red' : 'white'"
                class="w-full" />

            <!-- DateRange -->
            <UPopover v-else-if="config.type === 'dateRange'">
                <UButton color="white" icon="i-lucide-calendar" class="w-full justify-start text-left font-normal"
                    :class="[hasError ? 'ring-red-500 dark:ring-red-400' : '']">
                    {{ value?.start ? `${value.start} - ${value.end}` : (config.placeholder || '选择日期范围') }}
                </UButton>

                <template #content>
                    <div class="p-4">
                        <UCalendar :model-value="value" @update:model-value="handleUpdate" range
                            :number-of-months="2" />
                    </div>
                </template>
            </UPopover>

            <!-- Number -->
            <UInput v-else-if="config.type === 'number'" type="number" :model-value="value"
                @update:model-value="handleUpdate" :placeholder="config.placeholder" :color="hasError ? 'red' : 'white'"
                class="w-full" />

            <!-- Text Input (Default) -->
            <UInput v-else :model-value="value" @update:model-value="handleUpdate" :placeholder="config.placeholder"
                :color="hasError ? 'red' : 'white'" class="w-full" />
        </div>

        <Transition enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform -translate-y-1 opacity-0" enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in" leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-1 opacity-0">
            <p v-if="hasError" class="mt-1 text-xs text-red-500 flex items-center gap-1">
                <UIcon name="i-lucide-alert-circle" class="w-3 h-3" />
                {{ errorMessage }}
            </p>
        </Transition>
    </div>
</template>
