<script lang="ts" setup>
import type { SlideoverProps } from '@nuxt/ui'

interface CustomDrawerProps extends /* @vue-ignore */ SlideoverProps {
    title?: string
    description?: string
    showHeader?: boolean
    showFooter?: boolean
    showBack?: boolean
    backText?: string
    backIcon?: string
    confirmText?: string
    cancelText?: string
    confirmIcon?: string
    cancelIcon?: string
    confirmLoading?: boolean
    confirmDisabled?: boolean
    hideCancel?: boolean
    hideConfirm?: boolean
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string | number
}

interface CustomDrawerEmits {
    'after:leave': []
    'after:enter': []
    'close:prevent': []
    'update:open': [ value: boolean ]
    'confirm': []
    'cancel': []
    'back': []
}

const props = withDefaults(defineProps<CustomDrawerProps>(), {
    side: 'right',
    overlay: true,
    transition: true,
    modal: true,
    dismissible: true,
    portal: true,
    showHeader: true,
    showFooter: true,
    showBack: true,
    backText: '返回',
    backIcon: 'i-heroicons-arrow-left',
    confirmText: '确定',
    cancelText: '取消',
    confirmLoading: false,
    confirmDisabled: false,
    hideCancel: false,
    hideConfirm: false,
    size: 600,
})

const emit = defineEmits<CustomDrawerEmits>()

const handleAfterLeave = () => {
    emit('after:leave')
}

const handleAfterEnter = () => {
    emit('after:enter')
}

const handleClosePrevent = () => {
    emit('close:prevent')
}

const handleUpdateOpen = (value: boolean) => {
    emit('update:open', value)
}

const handleConfirm = () => {
    emit('confirm')
}

const handleCancel = () => {
    emit('cancel')
    emit('update:open', false)
}

const handleClose = () => {
    emit('update:open', false)
}

const handleBack = () => {
    emit('back')
    emit('update:open', false)
}

</script>

<template>
    <USlideover

        v-bind="props"
        @after:leave="handleAfterLeave"
        @after:enter="handleAfterEnter"
        @close:prevent="handleClosePrevent"
        @update:open="handleUpdateOpen"
    >
        <template v-if="$slots.trigger" #trigger>
            <slot name="trigger"/>
        </template>

        <template v-if="showHeader" #header>
            <slot name="header">
                <div class="flex items-center gap-3">
                    <UButton
                        v-if="showBack"
                        :icon="backIcon"
                        class="shrink-0"
                        color="gray"
                        size="xs"
                        variant="link"
                        @click="handleBack"
                    >
                        {{ backText }}
                    </UButton>

                    <div v-if="showBack && (title || $slots.title)"
                         class="h-4 w-px bg-gray-200 dark:bg-gray-700 shrink-0"/>

                    <div class="flex-1 min-w-0">
                        <h3 v-if="title || $slots.title"
                            class="text-base font-semibold text-gray-900 dark:text-white truncate">
                            <slot name="title">
                                {{ title }}
                            </slot>
                        </h3>
                        <p v-if="description || $slots.description"
                           class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                            <slot name="description">
                                {{ description }}
                            </slot>
                        </p>
                    </div>
                </div>
            </slot>
        </template>

        <template #body="slotProps">
            <slot v-bind="slotProps"/>
        </template>

        <template v-if="showFooter" #footer="slotProps">
            <slot name="footer" v-bind="slotProps">
                <div class="flex items-center justify-end gap-3">
                    <UButton
                        v-if="!hideCancel"
                        :disabled="confirmLoading"
                        :icon="cancelIcon"
                        color="gray"
                        variant="ghost"
                        @click="handleCancel"
                    >
                        {{ cancelText }}
                    </UButton>
                    <UButton
                        v-if="!hideConfirm"
                        :disabled="confirmDisabled"
                        :icon="confirmIcon"
                        :loading="confirmLoading"
                        color="primary"
                        @click="handleConfirm"
                    >
                        {{ confirmText }}
                    </UButton>
                </div>
            </slot>
        </template>
    </USlideover>
</template>
