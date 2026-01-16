<!--
 * @Description: 极简消息通知抽屉组件
 * @Author: weipc
 * @Date: 2025-01-13
-->
<script lang="ts" setup>
import { Bell } from 'lucide-vue-next';

interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    type?: 'system' | 'message' | 'task' | 'approval' | 'meeting';
    avatar?: string;
}

interface Props {
    visible: boolean;
    notifications: Notification[];
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    notifications: () => [],
});

const emit = defineEmits<{
    'update:visible': [value: boolean];
    'mark-read': [id: number];
    'delete': [id: number];
    'mark-all-read': [];
    'clear-all': [];
    'view-all': [];
}>();

const isOpen = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value),
});

const unreadCount = computed(() => {
    return props.notifications.filter((n: Notification) => !n.isRead).length;
});

function getIcon(type?: string) {
    switch (type) {
        case 'system': return 'i-lucide-settings';
        case 'message': return 'i-lucide-message-square';
        case 'task': return 'i-lucide-clipboard-list';
        case 'approval': return 'i-lucide-file-check';
        case 'meeting': return 'i-lucide-users';
        default: return 'i-lucide-bell';
    }
}

function getIconColorClass(type?: string) {
    switch (type) {
        case 'system': return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400';
        case 'message': return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400';
        case 'task': return 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400';
        case 'approval': return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400';
        case 'meeting': return 'bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400';
        default: return 'bg-neutral-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400';
    }
}

function markAsRead(id: number) {
    emit('mark-read', id);
}

function deleteNotification(id: number) {
    emit('delete', id);
}

function markAllAsRead() {
    emit('mark-all-read');
}

function clearAll() {
    emit('clear-all');
}

function viewAllMessages() {
    emit('view-all');
}
</script>

<template>
    <USlideover v-model:open="isOpen" title="通知" description="查看和管理您的系统通知" :ui="{
        width: 'w-screen max-w-md',
        overlay: {
            background: 'bg-neutral-900/50 dark:bg-neutral-950/50',
            backdrop: 'backdrop-blur-sm'
        },
        body: ['px-1 sm:px-0 px-2 py-1 sm:py-2'],
        header: ['p-4 sm:p-4 text-lg font-medium'],
        footer: ['p-4 sm:p-4'],
        zIndex: 'z-[1000]'
    }">
        <template #body>
            <div v-if="notifications.length === 0"
                class="flex flex-col items-center justify-center h-full py-8 text-gray-500">
                <div class="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-full mb-3">
                    <Bell class="w-6 h-6 text-gray-400" />
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">暂无通知</span>
            </div>

            <div v-else class="h-full overflow-y-auto">
                <div class="divide-y divide-gray-100 dark:divide-gray-800">
                    <div v-for="notification in notifications" :key="notification.id"
                        class="group relative flex items-start gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-all duration-200"
                        :class="{ 'bg-primary-50/40 dark:bg-primary-900/10': !notification.isRead }"
                        @click="markAsRead(notification.id)">
                        <!-- 左侧未读指示点 -->
                        <div v-if="!notification.isRead"
                            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary-500 rounded-r-full shadow-[0_0_8px_rgba(var(--ui-primary),0.5)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div v-if="!notification.isRead"
                            class="absolute left-2 top-5 w-2 h-2 bg-primary-500 rounded-full shadow-sm ring-2 ring-white dark:ring-gray-900" />

                        <!-- 头像/图标 -->
                        <div class="flex-shrink-0 mt-0.5">
                            <UAvatar :src="notification.avatar" :alt="notification.title"
                                :icon="!notification.avatar ? getIcon(notification.type) : undefined"
                                :class="!notification.avatar ? getIconColorClass(notification.type) : ''" size="md"
                                :ui="{ rounded: 'rounded-xl' }" />
                        </div>

                        <!-- 内容区域 -->
                        <div class="flex-1 min-w-0 space-y-1.5">
                            <div class="flex justify-between items-start gap-3">
                                <p class="text-sm font-medium text-gray-900 dark:text-white truncate pr-6"
                                    :class="{ 'font-bold': !notification.isRead }">
                                    {{ notification.title }}
                                </p>
                                <span class="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap tabular-nums">{{
                                    notification.time }}</span>
                            </div>
                            <p
                                class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed tracking-wide">
                                {{ notification.message }}
                            </p>
                        </div>

                        <!-- 悬浮操作按钮 -->
                        <div
                            class="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 flex flex-col gap-2">
                            <UTooltip text="标记已读" :popper="{ placement: 'left' }">
                                <UButton v-if="!notification.isRead" size="2xs" color="primary" variant="ghost"
                                    icon="i-heroicons-check" :ui="{ rounded: 'rounded-full' }"
                                    class="bg-white dark:bg-neutral-800 shadow-sm border border-gray-100 dark:border-gray-700"
                                    @click.stop="markAsRead(notification.id)" />
                            </UTooltip>
                            <UTooltip text="删除" :popper="{ placement: 'left' }">
                                <UButton size="2xs" color="red" variant="ghost" icon="i-heroicons-trash"
                                    :ui="{ rounded: 'rounded-full' }"
                                    class="bg-white dark:bg-neutral-800 shadow-sm border border-gray-100 dark:border-gray-700"
                                    @click.stop="deleteNotification(notification.id)" />
                            </UTooltip>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-between items-center gap-4 w-full pt-2">
                <UButton variant="ghost" icon="i-heroicons-chat-bubble-left-ellipsis" label="查看所有消息"
                    class="text-gray-500 hover:text-gray-900 dark:hover:text-white" @click="viewAllMessages" />
                <div class="flex gap-2">
                    <UButton v-if="unreadCount > 0" variant="soft" color="primary" size="xs"
                        icon="i-heroicons-check-circle" label="全部已读" @click="markAllAsRead" />
                    <UButton variant="ghost" color="gray" size="xs" icon="i-heroicons-trash" label="清空"
                        @click="clearAll" />
                </div>
            </div>
        </template>
    </USlideover>
</template>
