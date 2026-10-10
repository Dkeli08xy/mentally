<template>
  <!-- 绿丝带标识：中国精神卫生标志。纯内联 SVG，方便随主色变化 -->
  <svg
    class="mh-ribbon"
    :width="size"
    :height="size * 1.15"
    viewBox="0 0 120 138"
    role="img"
    aria-label="绿丝带 · 精神卫生标志"
  >
    <defs>
      <linearGradient :id="gradId" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" :stop-color="from" />
        <stop offset="100%" :stop-color="to" />
      </linearGradient>
    </defs>
    <g
      fill="none"
      :stroke="'url(#' + gradId + ')'"
      stroke-width="13"
      stroke-linecap="round"
    >
      <path d="M60 14 C 34 34 30 62 48 86 L76 122" />
      <path d="M60 14 C 86 34 90 62 72 86 L44 122" />
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: Number, default: 72 },
  /** brand：青绿丝带；light：浅色丝带（用于深色背景） */
  tone: { type: String, default: 'brand' },
})

const uid = Math.random().toString(36).slice(2, 8)
const gradId = computed(() => 'mh-ribbon-' + uid + '-' + props.tone)
const from = computed(() => (props.tone === 'light' ? '#ffffff' : '#2fa37c'))
const to = computed(() => (props.tone === 'light' ? '#d8f2e8' : '#146a55'))
</script>

<style scoped>
.mh-ribbon {
  display: block;
  filter: drop-shadow(0 6px 14px rgba(20, 106, 85, 0.28));
}
</style>
