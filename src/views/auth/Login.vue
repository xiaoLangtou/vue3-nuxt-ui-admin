<script lang="ts" setup>
import type { FormError, FormSubmitEvent } from '@nuxt/ui';
import type { ICaptcha, ILoginAccount } from '@/services/types/login';
import FloatingConfigurator from '@/components/floating-configurator/index.vue';
import { CAPTCHA_EXPIRE_TIME } from '@/global/constants';
import globalToast from '@/services/core/toast';
import { loginService } from '@/services/modules/login';
import { useAuthStore } from '@/stores/auth';
import { to } from '@/utils/result-handler';

const {loginAction} = useAuthStore();

const state = reactive<ILoginAccount>({
    username: 'admin',
    password: '12345678',
    captcha: '',
    captchaId: '',
});

const captchaImage = ref('');
const loading = ref(false);
const isCaptchaExpired = ref(false);
const rememberMe = ref(false);
let expireTimer: NodeJS.Timeout | null = null;

/**
 * 表单验证规则
 */
function validate(state: Partial<ILoginAccount>): FormError[] {
    const errors: FormError[] = [];

    if ( !state.username ) {
        errors.push({name: 'username', message: '请输入账号'});
    }

    if ( !state.password ) {
        errors.push({name: 'password', message: '请输入密码'});
    } else if ( state.password.length < 6 ) {
        errors.push({name: 'password', message: '密码至少6个字符'});
    }

    if ( !state.captcha ) {
        errors.push({name: 'captcha', message: '请输入验证码'});
    }

    return errors;
}

/**
 * 获取验证码图片
 */
async function getCaptcha() {
    const result = await to<ICaptcha>(loginService.getCaptchaImage());
    if ( !result.ok ) {
        globalToast.error('获取验证码失败,请重试');
        return;
    }
    state.captchaId = result.value.captchaId;
    captchaImage.value = `data:image/svg+xml;base64,${ btoa(result.value.captcha) }`;

    startCaptchaExpireTimer();
}

/**
 * 启动验证码过期定时器
 */
function startCaptchaExpireTimer() {
    if ( expireTimer ) {
        clearTimeout(expireTimer);
    }

    isCaptchaExpired.value = false;

    expireTimer = setTimeout(() => {
        isCaptchaExpired.value = true;
    }, CAPTCHA_EXPIRE_TIME);
}

/**
 * 表单提交处理
 */
async function onSubmit(event: FormSubmitEvent<ILoginAccount>) {
    try {
        loading.value = true;
        await loginAction(event.data);
        globalToast.success(`${ getGreeting() }，欢迎回来！`);
    } catch {
        await getCaptcha();
        state.captcha = '';
    } finally {
        loading.value = false;
    }
}

/**
 * 获取问候语
 */
function getGreeting() {
    const hour = new Date().getHours();
    if ( hour < 12 )
        return '早上好';
    if ( hour < 18 )
        return '下午好';
    return '晚上好';
}

onMounted(() => {
    getCaptcha();
});

onUnmounted(() => {
    if ( expireTimer ) {
        clearTimeout(expireTimer);
    }
});
</script>

<template>
    <FloatingConfigurator/>
    <div
        class="bg-neutral-0 dark:bg-neutral-900 min-h-screen w-full flex overflow-hidden text-gray-900 dark:text-gray-0">
        <!-- 左侧视觉区域 -->
        <div class="hidden lg:flex lg:w-1/2 relative bg-primary-600 items-center justify-center overflow-hidden">
            <!-- 背景渐变与装饰 -->
            <div class="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-800 opacity-90 z-0"/>
            <div
                class="absolute inset-0 bg-[url('@/assets/images/login-bg.png')] bg-cover bg-center opacity-10 mix-blend-overlay z-0"
            />

            <!-- 动态光斑 -->
            <div
                class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/20 rounded-full blur-[100px] animate-pulse-slow"
            />
            <div
                class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-900/30 rounded-full blur-[120px]"
            />

            <!-- 内容展示 -->
            <div class="relative z-10 flex flex-col items-center text-center px-12">
                <div class="mb-12 relative">
                    <!-- 光效背景 -->
                    <div class="absolute inset-0 bg-white/20 blur-3xl rounded-full transform scale-75"/>
                    <img
                        alt="Illustration"
                        class="w-[400px] relative z-10 drop-shadow-2xl animate-float" src="@/assets/images/login-bg.png"
                    >
                </div>
                <h2 class="text-3xl xl:text-4xl font-bold text-white mb-4 tracking-tight">
                    欢迎使用 Sakai Vue
                </h2>
                <p class="text-primary-100 text-lg max-w-md leading-relaxed">
                    构建现代化、高效、安全的企业级应用系统的最佳选择。
                </p>
            </div>
        </div>

        <!-- 右侧表单区域 -->
        <div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
            <!-- 移动端顶部装饰 -->
            <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-500 to-primary-700 lg:hidden"/>

            <div class="w-full max-w-[420px] space-y-8">
                <!-- 头部信息 -->
                <div class="text-center mb-8">
                    <div
                        class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-6 shadow-sm"
                    >
                        <img alt="Logo" class="w-10 h-10" src="@/assets/images/logo.svg">
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-0 mb-2">
                        登录账户
                    </h1>
                    <p class="text-gray-500 dark:text-gray-400">
                        请输入您的账号密码以继续
                    </p>
                </div>

                <!-- 表单内容 -->
                <UForm :state="state" :validate="validate" class="space-y-5" @submit="onSubmit">
                    <!-- 账号 -->
                    <UFormField class="w-full text-base" label="账号" name="username" required>
                        <UInput
                            v-model="state.username"
                            autocomplete="username"
                            class="w-full text-base"
                            icon="i-lucide-user"
                            placeholder="请输入账号"
                            size="xl"
                        />
                    </UFormField>

                    <!-- 密码 -->
                    <UFormField class="text-base" label="密码" name="password" required>
                        <UInput
                            v-model="state.password"
                            autocomplete="current-password"
                            class="w-full text-base"
                            icon="i-lucide-lock"
                            placeholder="请输入密码"
                            size="xl"
                            type="password"
                        />
                    </UFormField>

                    <!-- 验证码 -->
                    <UFormField class="text-base" label="验证码" name="captcha" required>
                        <div class="flex gap-3 items-center">
                            <div class="flex-1">
                                <UInput
                                    v-model="state.captcha"
                                    autocomplete="off"
                                    class="w-full text-base"
                                    icon="i-lucide-shield"
                                    placeholder="请输入验证码"
                                    size="xl"
                                />
                            </div>
                            <div class="relative shrink-0">
                                <div
                                    class="h-[40px] w-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer relative group transition-all hover:border-primary-500 hover:shadow-sm"
                                    @click="getCaptcha"
                                >
                                    <img
                                        v-if="captchaImage"
                                        :src="captchaImage"
                                        alt="验证码"
                                        class="w-full h-full object-cover"
                                    >
                                    <div
                                        v-else
                                        class="w-full h-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 text-xs text-gray-400"
                                    >
                                        <UIcon class="mr-1 animate-spin" name="i-lucide-refresh-cw"/>
                                        获取中
                                    </div>

                                    <!-- 过期遮罩 -->
                                    <div
                                        v-if="isCaptchaExpired"
                                        class="absolute inset-0 bg-neutral-900/80 backdrop-blur-[1px] flex flex-col items-center justify-center text-white/90 z-10"
                                    >
                                        <UIcon class="mb-1 text-orange-400" name="i-lucide-alert-circle"/>
                                        <span class="text-xs font-medium">点击刷新</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </UFormField>

                    <!-- 选项 -->
                    <div class="flex items-center justify-between ">
                        <UCheckbox v-model="rememberMe" label="记住我"/>
                        <UButton color="primary" label="忘记密码？" variant="link"/>
                    </div>

                    <!-- 登录按钮 -->
                    <UButton
                        :loading="loading"
                        block
                        class="font-semibold shadow-lg shadow-primary-500/20 cursor-pointer"
                        label="登录"
                        size="xl"
                        type="submit"
                    />
                </UForm>

                <!-- 底部 -->
                <div class="text-center mt-8 text-base text-gray-500 dark:text-gray-400">
                    还没有账号？
                    <span class="font-medium text-primary-600 hover:text-primary-700 cursor-pointer transition-colors">
            立即注册
          </span>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
/* 浮动动画 */
@keyframes float {
    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-20px);
    }
}

.animate-float {
    animation: float 6s ease-in-out infinite;
}

/* 缓慢脉冲 */
@keyframes pulse-slow {
    0%,
    100% {
        opacity: 0.4;
        transform: scale(1);
    }

    50% {
        opacity: 0.2;
        transform: scale(1.1);
    }
}

.animate-pulse-slow {
    animation: pulse-slow 8s infinite ease-in-out;
}
</style>
