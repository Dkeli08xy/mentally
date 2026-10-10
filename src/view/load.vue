<template>
  <!-- src/view/load.vue · 活动封面页 -->
  <router-link to="/home" class="cover" :aria-label="EVENT.name + ' 活动封面，点击进入'">
    <div class="cover__bg"></div>
    <div class="cover__tint"></div>

    <div class="cover__content">
      <RibbonMark :size="84" tone="light" />
      <p class="cover__meta">{{ EVENT.year }} · {{ EVENT.ordinal }}{{ EVENT.name }}</p>
      <h1 class="cover__title">{{ EVENT.badge }}<span>{{ EVENT.name }}</span></h1>
      <p class="cover__slogan">{{ EVENT.slogan }}</p>
      <p class="cover__theme">{{ EVENT.themeText }}</p>
      <span class="cover__tip">{{ EVENT.loadingTip }}</span>
    </div>

    <p class="cover__footer">{{ EVENT.organizer }}</p>
  </router-link>
</template>

<script setup>
import { EVENT } from '../config/event'
import RibbonMark from '../components/common/RibbonMark.vue'
</script>

<style scoped>
.cover {
  position: relative;
  display: block;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  font-family: var(--mh-font);
}

.cover__bg {
  position: absolute;
  inset: 0;
  background: url('../assets/images/load/bg.png') center center / cover no-repeat;
  transform: scale(1.02);
}

/* 青绿色蒙版：把原插画统一到绿丝带主色 */
.cover__tint {
  position: absolute;
  inset: 0;
  background: linear-gradient(155deg, rgba(10, 58, 47, 0.78) 0%, rgba(20, 106, 85, 0.58) 45%, rgba(242, 166, 90, 0.3) 100%);
}

.cover__content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 12vh 24px 16vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
}

.cover__meta {
  margin-top: 18px;
  font-size: 15px;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.86);
}

.cover__title {
  display: flex;
  align-items: baseline;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  font-size: clamp(34px, 6vw, 62px);
  font-weight: 800;
  color: #fff;
  letter-spacing: 2px;
  text-shadow: 0 6px 26px rgba(6, 40, 32, 0.5);
}

.cover__title span {
  font-size: clamp(24px, 4vw, 44px);
  font-weight: 700;
}

.cover__slogan {
  margin-top: 6px;
  font-size: clamp(17px, 2.4vw, 24px);
  color: #fff;
  letter-spacing: 1px;
}

.cover__theme {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.82);
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(4px);
}

.cover__tip {
  margin-top: 30px;
  font-size: 15px;
  color: #fff;
  padding: 10px 26px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.4);
  animation: coverPulse 2.2s ease-in-out infinite;
}

@keyframes coverPulse {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.92;
  }
  50% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

.cover__footer {
  position: absolute;
  z-index: 1;
  left: 0;
  right: 0;
  bottom: 24px;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  padding: 0 24px;
}

@media (max-width: 768px) {
  .cover__content {
    padding: 10vh 18px 14vh;
  }

  .cover__meta {
    font-size: 13px;
  }

  .cover__tip {
    font-size: 13px;
    padding: 8px 18px;
  }
}
</style>
