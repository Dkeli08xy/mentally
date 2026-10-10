<template>
  <div class="mh-topbar">
    <router-link v-if="backTo" :to="backTo" class="mh-back">← {{ backLabel }}</router-link>
    <div class="mh-topbar__title">
      {{ title }}
      <span v-if="subtitle" class="mh-topbar__sub">{{ subtitle }}</span>
    </div>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  backTo: { type: String, default: '' },
  backLabel: { type: String, default: '返回' },
})
</script>

<style scoped>
.mh-topbar__sub {
  display: block;
  margin-top: 2px;
  font-size: 13px;
  font-weight: 400;
  color: var(--mh-muted);
}

/* 插画背景页面的顶栏配色统一在 src/style.css 的 .mh-page--art 规则中处理 */
</style>
