<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: '配置',
  },
});
</script>

<template>
  <div class="section">
    <slot name="title">
      <Divider align="center" type="solid">
        <b>{{ title }}</b>
      </Divider>
    </slot>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.section {
  & > * + * {
    margin-top: 1rem;
  }
}
</style>
