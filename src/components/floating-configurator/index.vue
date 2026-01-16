<script lang="ts" setup>
import { Moon, Palette, Sun } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useLayoutStore } from '@/stores/layout.ts';

const layoutStore = useLayoutStore();
const { isDarkTheme } = storeToRefs(layoutStore);
const { toggleDarkMode } = layoutStore;

const showConfigurator = ref(false);

function toggleConfigurator() {
  showConfigurator.value = !showConfigurator.value;
}
</script>

<template>
  <div class="fixed flex gap-4 top-8 right-8 z-50">
    <UButton
      color="gray"
      variant="solid"
      size="lg"
      square
      @click="toggleDarkMode"
    >
      <template #leading>
        <Moon v-if="isDarkTheme" :size="20" />
        <Sun v-else :size="20" />
      </template>
    </UButton>

    <div class="relative">
      <UButton
        color="primary"
        variant="solid"
        size="lg"
        square
        @click="toggleConfigurator"
      >
        <template #leading>
          <Palette :size="20" />
        </template>
      </UButton>
    </div>
  </div>
</template>
