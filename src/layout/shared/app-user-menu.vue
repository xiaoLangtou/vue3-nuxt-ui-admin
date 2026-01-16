<script lang="ts" setup>
import type { DropdownMenuItem } from '@nuxt/ui';
import { useColorMode } from '@vueuse/core';
import { useAuthStore } from '@/stores';
import { useLayoutStore } from '@/stores/layout';
import { gray_COLORS, PRIMARY_COLORS } from '@/preferences/colors';
import type { group } from 'console';

defineProps<{
  collapsed?: boolean;
}>();

const colorMode = useColorMode();
const appConfig = useAppConfig();
const layoutStore = useLayoutStore();
const { openConfigDrawer } = layoutStore;
const authStore = useAuthStore();

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

const user = computed(() => ({
  name: authStore.userInfo?.nickname || 'User',
  email: authStore.userInfo?.email || 'user@example.com',
  roles: authStore.userInfo?.roles || [],
  avatar: {
    src: authStore.userInfo?.headPic,
    alt: authStore.userInfo?.nickname || 'User',
  },
}));

const items = computed<DropdownMenuItem[][]>(() => ([
  [{
    slot: 'account',
    label: user.value.name,
  }],
  [{
    label: '个人信息',
    icon: 'i-lucide-user',
  }, {
    label: '系统设置',
    icon: 'i-lucide-settings',
    onSelect: () => openConfigDrawer(),
  }, {
    label: '消息通知',
    icon: 'i-lucide-bell',
  }],
  [{
    label: '主题',
    icon: 'i-lucide-palette',
    children: [{
      label: '主色',
      slot: 'chip',
      chip: appConfig.ui.colors.primary,
      content: {
        align: 'center',
        collisionPadding: 16,
      },
      children: colors.map(color => ({
        label: color,
        chip: color,
        slot: 'chip',
        checked: appConfig.ui.colors.primary === color,
        type: 'checkbox',
        onSelect: (e: Event) => {
          e.preventDefault();
          appConfig.ui.colors.primary = color;
        },
      })),
    }, {
      label: '中性色',
      slot: 'chip',
      chip: appConfig.ui.colors.neutral === 'neutral' ? 'old-neutral' : appConfig.ui.colors.neutral,
      content: {
        align: 'end',
        collisionPadding: 16,
      },
      children: neutrals.map(color => ({
        label: color,
        chip: color === 'neutral' ? 'old-neutral' : color,
        slot: 'chip',
        type: 'checkbox',
        checked: appConfig.ui.colors.neutral === color,
        onSelect: (e: Event) => {
          e.preventDefault();
          appConfig.ui.colors.neutral = color;
        },
      })),
    }],
  }, {
    label: '外观',
    icon: 'i-lucide-sun-moon',
    children: [{
      label: '明亮',
      icon: 'i-lucide-sun',
      type: 'checkbox',
      checked: colorMode.value === 'light',
      onSelect(e: Event) {
        e.preventDefault();
        colorMode.value = 'light';
      },
    }, {
      label: '暗黑',
      icon: 'i-lucide-moon',
      type: 'checkbox',
      checked: colorMode.value === 'dark',
      onSelect(e: Event) {
        e.preventDefault();
        colorMode.value = 'dark';
      },
    }],
  }],
  [{
    label: '退出登录',
    icon: 'i-lucide-log-out',
    onSelect: () => {
      authStore.logoutAction();
    },
  }],
]));
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{
      side: collapsed ? 'right' : 'top',
      sideOffset: 8,
      align: collapsed ? 'end' : 'center',
      collisionPadding: 8,
    }"
    :ui="{ content: collapsed ? 'w-100' : 'w-[var(--reka-dropdown-menu-trigger-width)]',item:'py-2.5 text-[14px]' }"
    class="w-full"
  >
    <UButton
      v-bind="{
        ...user,
        label: undefined,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-neutral-100 dark:data-[state=open]:bg-neutral-800"
      :ui="{
        base: 'py-2 px-3',
        trailingIcon: 'text-gray-500 dark:text-gray-400 size-5 ml-auto',
        leadingAvatar: 'size-10',
        font: 'font-normal text-base',
      }"
    >
      <template v-if="!collapsed">
        <div class="text-left min-w-0 flex-1">
          <p class="font-medium text-sm truncate leading-none mb-0!">{{ user.name }}</p>
          <div v-if="user.roles.length" class="flex flex-wrap gap-1 mt-0.5">
            <UBadge
              v-for="role in user.roles.slice(0, 2)"
              :key="role"
              :label="role.name"
              variant="subtle"
              size="xs"
              class="font-normal px-1.5"
            />
            <span v-if="user.roles.length > 2" class="text-xs text-gray-500 dark:text-gray-400 self-center">
              +{{ user.roles.length - 2 }}
            </span>
          </div>
        </div>
      </template>
    </UButton>

    <template #account>
      <div class="flex items-center gap-3 min-w-0">
        <UAvatar
          :src="user.avatar.src"
          :alt="user.avatar.alt"
          size="2xl"
        />
        <div class="flex flex-col min-w-0 flex-1 items-start gap-0.5">
          <p class="text-sm font-semibold text-gray-900 dark:text-white truncate mb-0!">
            {{ user.name }}
          </p>
          <p v-if="user.email" class="text-xs font-normal text-gray-500 dark:text-gray-400 truncate mb-0!">
            {{ user.email }}
          </p>
        </div>
      </div>
    </template>

    <template #chip-leading="{ item }">
      <div class="inline-flex items-center justify-center shrink-0 size-5">
        <span
          class="rounded-full ring ring-gray-200 dark:ring-gray-700 bg-[var(--chip-light)] dark:bg-[var(--chip-dark)] size-2"
          :style="{
            '--chip-light': `var(--color-${(item as any).chip}-500)`,
            '--chip-dark': `var(--color-${(item as any).chip}-400)`
          }"
        />
      </div>
    </template>
  </UDropdownMenu>
</template>
