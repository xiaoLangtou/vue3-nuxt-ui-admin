<script setup lang="ts">
import { useLogsDetailQuery } from '@/services/composables/useLogsQuery';
import { useTheme } from '@/stores/layout/theme';
import { JsonViewer } from 'vue3-json-viewer';
import "vue3-json-viewer/dist/vue3-json-viewer.css";

const {layoutConfig} = useLayoutStore()

console.log(layoutConfig.value)

const props = defineProps<{
    logId?: string | number;
}>();

const isOpen = defineModel<boolean>('open', { default: false });

const { data: logDetail, isLoading } = useLogsDetailQuery(
    computed(() => props.logId!),
    { enabled: computed(() => isOpen.value && !!props.logId) }
);

const getJsonObject = (str?: string) => {
    if (!str) return {};
    try {
        return JSON.parse(str);
    } catch {
        return { content: str };
    }
};
</script>

<template>
    <USlideover v-model:open="isOpen" title="日志详情" :ui="{ content: 'w-screen max-w-[50%]' }">
        <template #body>
            <div v-if="isLoading" class="flex justify-center py-12">
                <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
            </div>

            <div v-else-if="logDetail" class="space-y-4">
                <!-- 基本信息 -->
                <div>
                    <div class="flex items-center mb-4 mt-2">
                        <div
                            class="bg-primary-100 dark:bg-primary-900/30 p-1.5 rounded-md mr-3 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                            <UIcon name="i-lucide-info" class="w-5 h-5" />
                        </div>
                        <span class="font-bold text-lg text-gray-800 dark:text-gray-100">基本信息</span>
                        <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700 ml-4"></div>
                    </div>

                    <dl class="grid grid-cols-2 gap-x-4 gap-y-6">
                        <div>
                            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">日志类型</dt>
                            <dd class="mt-1">
                                <UBadge :label="logDetail.logType" color="primary" variant="subtle" />
                            </dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">所属模块</dt>
                            <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ logDetail.module }}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">请求方法</dt>
                            <dd class="mt-1">
                                <UBadge :label="logDetail.requestMethod" color="blue" variant="subtle" />
                            </dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">请求IP</dt>
                            <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ logDetail.requestIp }} ({{
                                logDetail.requestIpAddr }})</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">浏览器</dt>
                            <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ logDetail.browser }}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">操作系统</dt>
                            <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ logDetail.os }}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">耗时</dt>
                            <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ logDetail.requestTimeConsume }} ms
                            </dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">状态</dt>
                            <dd class="mt-1">
                                <UBadge :label="logDetail.status === 200 ? '成功' : '失败'"
                                    :color="logDetail.status === 200 ? 'success' : 'error'" variant="subtle" />
                            </dd>
                        </div>
                    </dl>
                </div>
                <!-- 请求信息 -->
                <div>
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">请求地址</label>
                    <p class="mt-1 text-sm font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded break-all">{{
                        logDetail.requestUrl }}</p>
                </div>

                <div class="flex items-center mb-4 mt-2">
                    <div
                        class="bg-primary-100 dark:bg-primary-900/30 p-1.5 rounded-md mr-3 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                        <UIcon name="i-lucide-info" class="w-5 h-5" />
                    </div>
                    <span class="font-bold text-lg text-gray-800 dark:text-gray-100">请求信息</span>
                    <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700 ml-4"></div>
                </div>

                <div>
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">请求参数</label>
                    <JsonViewer :value="getJsonObject(logDetail.requestParam)" copyable boxed sort />
                </div>

                <div>
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">请求头</label>
                    <JsonViewer :value="getJsonObject(logDetail.requestHeader)" copyable boxed sort />
                </div>

                <div>
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">请求体</label>
                    <JsonViewer :value="getJsonObject(logDetail.requestBody)" copyable boxed sort />
                </div>

                <div>
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">响应头</label>
                    <JsonViewer :value="getJsonObject(logDetail.responseHeader)" copyable boxed sort />
                </div>

                <div>
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">响应体</label>
                    <JsonViewer :value="getJsonObject(logDetail.responseBody)" copyable boxed sort />
                </div>
            </div>
        </template>
    </USlideover>
</template>
