<script setup lang="ts">
interface Props {
  title?: string;
  message?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  color?: string;
  icon?: string;
  preventClose?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '确认操作',
  acceptLabel: '确认',
  rejectLabel: '取消',
  color: 'primary',
  icon: 'i-lucide-alert-circle',
  preventClose: false,
});

const emit = defineEmits<{
  (e: 'close', value: boolean): void;
}>();

function handleConfirm() {
  emit('close', true);
}

function handleCancel() {
  emit('close', false);
}
</script>

<template>
  <UModal
    :dismissible="!preventClose"
    :ui="{
      content: 'sm:max-w-lg rounded-xl shadow-2xl overflow-visible',
      padding: 'p-0',
    }"
  >
    <template #content>
      <div class="p-6 bg-white dark:bg-gray-900 rounded-xl">
        <div class="flex items-start gap-4">
          <!-- Icon -->
          <UButton
            v-if="icon"
            :icon="icon"
            :color="color"
            variant="soft"
            class="flex-shrink-0 pointer-events-none rounded-full p-2"
            :ui="{ rounded: 'rounded-full', icon: { size: { sm: 'w-5 h-5' } } }"
          />

          <!-- Content -->
          <div class="flex-1 min-w-0 pt-1.5">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ title }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {{ message }}
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-8 flex items-center justify-end gap-3">
          <UButton
            color="gray"
            variant="outline"
            :label="rejectLabel"
            class="px-4 cursor-pointer"
            @click="handleCancel"
          />
          <UButton
            :color="color || 'primary'"
            variant="solid"
            :label="acceptLabel"
            class="px-4 cursor-pointer"
            @click="handleConfirm"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
