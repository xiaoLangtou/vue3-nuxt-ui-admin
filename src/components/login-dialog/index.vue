<script setup lang="ts">
import type { ICaptcha, ILoginAccount } from '@/services/types/login.ts';

import { CAPTCHA_EXPIRE_TIME } from '@/global/constants.ts';
import router from '@/router';
import globalToast from '@/services/core/toast.ts';
import { loginService } from '@/services/modules/login.ts';
import { useAuthStore } from '@/stores/auth.ts';
import { to } from '@/utils/result-handler.ts';

interface Props {
  /** 是否显示弹窗 */
  visible: boolean;
}

interface Emits {
  /** 更新显示状态 */
  (e: 'update:visible', value: boolean): void;
  /** 登录成功事件 */
  (e: 'login-success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { loginAction } = useAuthStore();

// 使用计算属性处理 v-model
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

const account = reactive<ILoginAccount>({
  username: '',
  password: '',
  captcha: '',
  captchaId: '',
});

const captchaImage = ref('');
const loading = ref(false);
const isCaptchaExpired = ref(false);
let expireTimer: NodeJS.Timeout | null = null;

/**
 * 获取验证码图片
 */
async function getCaptcha() {
  const result = await to<ICaptcha>(loginService.getCaptchaImage());
  if (!result.ok) {
    console.error('获取验证码失败:', result.error);
    return;
  }
  account.captchaId = result.value.captchaId;
  captchaImage.value = `data:image/svg+xml;base64,${btoa(result.value.captcha)}`;

  // 开始过期定时器
  startCaptchaExpireTimer();
}

/**
 * 启动验证码过期定时器
 */
function startCaptchaExpireTimer() {
  // 清除之前的定时器
  if (expireTimer) {
    clearTimeout(expireTimer);
  }

  // 重置过期状态
  isCaptchaExpired.value = false;

  // 设置过期定时器
  expireTimer = setTimeout(() => {
    isCaptchaExpired.value = true;
  }, CAPTCHA_EXPIRE_TIME);
}

/**
 * 关闭过期提示并重新获取验证码
 */
function closeCaptchaExpiredModal() {
  isCaptchaExpired.value = false;
  getCaptcha();
}

/**
 * 登录处理
 */
async function handleLogin() {
  try {
    if (!account.username || !account.password) {
      return globalToast.warn('请输入账号和密码');
    }

    if (!account.captcha) {
      return globalToast.warn('请输入验证码');
    }

    loading.value = true;
    const name = router.currentRoute.value.name ?? '';
    await loginAction(account, name as string, false);
    globalToast.success(`${getGreeting()}，欢迎回来！`);

    // 登录成功，关闭弹窗
    emit('update:visible', false);
    emit('login-success');
  }
  catch {
    // 登录失败，重新获取验证码
    await getCaptcha();
    account.captcha = '';
  }
  finally {
    loading.value = false;
  }
}

/**
 * 重置表单
 */
function resetForm() {
  account.username = '';
  account.password = '';
  account.captcha = '';
  account.captchaId = '';
  captchaImage.value = '';
  isCaptchaExpired.value = false;
  if (expireTimer) {
    clearTimeout(expireTimer);
    expireTimer = null;
  }
}

// 监听弹窗显示状态
watch(
  () => props.visible,
  (newVisible: boolean) => {
    if (newVisible) {
      // 弹窗打开时获取验证码
      getCaptcha();
    }
    else {
      // 弹窗关闭时重置表单
      resetForm();
    }
  },
);

// 组件卸载时清除定时器
onUnmounted(() => {
  if (expireTimer) {
    clearTimeout(expireTimer);
  }
});

// 写个方法，用来判断时间，区分上午、下午、晚上
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12)
    return '早上好';
  if (hour < 18)
    return '下午好';
  return '晚上好';
}
</script>

<template>
  <UModal v-model:open="visible" title="重新登录" :ui="{ content: 'max-w-md' }" :dismissible="false" :close="false">
    <template #body>
      <div class="flex flex-col gap-6">
        <div class="text-center">
          <div class="text-gray-500 dark:text-gray-400 text-sm mb-4">
            登录已过期，请重新登录
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div>
            <label for="dialog-username" class="block text-gray-900 dark:text-gray-100 font-medium mb-2"> 账号 </label>
            <UInput
              id="dialog-username"
              v-model="account.username"
              type="text"
              placeholder="请输入账号"
              @keyup.enter="handleLogin"
            />
          </div>

          <div>
            <label for="dialog-password" class="block text-gray-900 dark:text-gray-100 font-medium mb-2"> 密码 </label>
            <UInput
              id="dialog-password"
              v-model="account.password"
              type="password"
              placeholder="请输入密码"
              @keyup.enter="handleLogin"
            />
          </div>

          <div>
            <label for="dialog-captcha" class="block text-gray-900 dark:text-gray-100 font-medium mb-2"> 验证码 </label>
            <div class="flex items-center gap-3">
              <UInput
                id="dialog-captcha"
                v-model="account.captcha"
                type="text"
                placeholder="请输入验证码"
                class="flex-1"
                @keyup.enter="handleLogin"
              />
              <!-- 验证码图片 -->
              <div class="shrink-0">
                <div class="relative cursor-pointer" @click="getCaptcha">
                  <img v-if="captchaImage" :src="captchaImage" alt="验证码" class="h-10 border rounded">
                  <div v-else class="h-10 w-20 border rounded flex items-center justify-center text-xs text-gray-500">
                    点击获取
                  </div>
                  <!-- 验证码过期蒙层 -->
                  <div v-if="isCaptchaExpired" class="absolute inset-0 bg-black/60 flex items-center justify-center rounded cursor-pointer" @click="closeCaptchaExpiredModal">
                    <div class="text-white text-xs text-center px-2">
                      <UIcon name="i-lucide-alert-triangle" class="text-orange-400 mb-1 block" />
                      <div class="text-xs opacity-80">
                        点击刷新
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <UButton label="登录" block :loading="loading" @click="handleLogin" />
        </div>
      </div>
    </template>
  </UModal>
</template>

<style lang="scss" scoped>
/* Nuxt UI 样式已内置,无需额外样式 */
</style>
