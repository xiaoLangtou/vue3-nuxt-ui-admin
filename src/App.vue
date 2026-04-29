<script setup lang="ts">
import { LoginDialog } from '@/components/login-dialog';
import { useLoginDialog } from '@/composables/useLoginDialog';

const { isLoginDialogVisible } = useLoginDialog();
</script>

<template>
  <UApp>
    <RouterView />
    <LoginDialog v-model:visible="isLoginDialogVisible" />
  </UApp>
</template>

<style lang="scss" scoped>

</style>
