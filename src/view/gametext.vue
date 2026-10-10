<template>
  <!-- src/view/gametext.vue · 挑战选择页 -->
  <div class="mh-page game-pick">
    <div class="mh-shell">
      <PageHead title="心理趣味挑战" :subtitle="EVENT.name + ' · 三个可量化的心理小实验'" back-to="/home" back-label="返回首页">
        <span class="mh-tag">数据仅存本机</span>
      </PageHead>

      <p class="mh-tip">
        每个挑战都取材于经典心理学实验范式：<strong>看清自己的心理活动，比给自己下结论更重要</strong>。
        所有成绩只保存在当前浏览器中，可随时在「我的记录」里查看或清空。
      </p>

      <section class="game-list">
        <article v-for="game in GAMES" :key="game.key" class="mh-card game-card">
          <div class="game-card__cover">
            <img :src="covers[game.key]" :alt="game.name + ' 封面'" />
            <span class="game-card__index" :style="{ background: game.accent }">{{ game.icon }}</span>
          </div>

          <div class="game-card__body">
            <h2 class="game-card__title">
              {{ game.name }}
              <span class="mh-tag">{{ game.shortName }}</span>
            </h2>
            <p class="game-card__tagline">{{ game.tagline }}</p>
            <p class="game-card__desc">{{ game.desc }}</p>

            <div class="game-card__actions">
              <router-link :to="game.easy.route" class="mode" :style="{ borderColor: game.accent + '55' }">
                <span class="mode__label" :style="{ color: game.accent }">{{ game.easy.label }}</span>
                <span class="mode__note">{{ game.easy.note }}</span>
              </router-link>
              <router-link :to="game.hard.route" class="mode" :style="{ borderColor: game.accent + '55' }">
                <span class="mode__label" :style="{ color: game.accent }">{{ game.hard.label }}</span>
                <span class="mode__note">{{ game.hard.note }}</span>
              </router-link>
              <router-link :to="game.science.route" class="mh-btn mh-btn--ghost mh-btn--sm">{{ game.science.label }}</router-link>
              <button class="mh-btn mh-btn--ghost mh-btn--sm" @click="openStats(game)">{{ game.stats.label }}</button>
            </div>
          </div>
        </article>
      </section>

      <section class="mh-statement">
        <h4>温馨提示</h4>
        <p>1. 挑战结果与当下的疲劳、光线、设备状态都有关，单次成绩不代表你的能力水平。</p>
        <p>
          2. 记忆挑战可以在开始前选择整体时间档：快速版约 1 分 40 秒、标准版约 3 分 20 秒、深度版约 5 分钟，
          延时期间静置等待即可，建议在安静环境中完成。
        </p>
        <p>3. 情绪识别素材来自公开人脸表情图片与短视频，仅用于情绪辨认练习；微表情不能作为判断他人真实想法的依据。</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { EVENT, GAMES } from '../config/event'
import PageHead from '../components/common/PageHead.vue'
import coverReaction from '../assets/images/game/反应.webp'
import coverMemory from '../assets/images/game/记忆.webp'
import coverExpression from '../assets/images/game/表情.webp'
import {
  ReactionTimeEasyStorage,
  ReactionTimeHardStorage,
  MemoryDecayEasyStorage,
  MemoryDecayHardStorage,
  MicroExpressionEasyStorage,
  MicroExpressionHardStorage,
} from '../utils/localStorage'

const router = useRouter()

const covers = {
  reaction: coverReaction,
  memory: coverMemory,
  expression: coverExpression,
}

/** 各挑战的「成绩分布」入口：有数据才允许进入 */
const statsCheck = {
  reaction: () => [ReactionTimeEasyStorage, ReactionTimeHardStorage],
  memory: () => [MemoryDecayEasyStorage, MemoryDecayHardStorage],
  expression: () => [MicroExpressionEasyStorage, MicroExpressionHardStorage],
}

const openStats = (game) => {
  const stores = (statsCheck[game.key] || [])()
  const count = stores.reduce((sum, store) => sum + store.count(), 0)
  if (!count) {
    ElMessage.warning('还没有该挑战的成绩，先完成一次测试吧')
    return
  }
  router.push(game.stats.route)
}
</script>

<style scoped>
.game-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.game-card {
  display: flex;
  gap: 22px;
  align-items: stretch;
}

.game-card__cover {
  position: relative;
  width: 220px;
  flex-shrink: 0;
  border-radius: 14px;
  overflow: hidden;
  background: var(--mh-primary-soft);
}

.game-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.game-card:hover .game-card__cover img {
  transform: scale(1.04);
}

.game-card__index {
  position: absolute;
  left: 10px;
  top: 10px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 17px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.game-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.game-card__title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 19px;
  font-weight: 700;
  color: var(--mh-ink);
}

.game-card__tagline {
  font-size: 14px;
  font-weight: 600;
  color: var(--mh-primary);
}

.game-card__desc {
  font-size: 13px;
  line-height: 1.8;
  color: var(--mh-muted);
}

.game-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
  padding-top: 12px;
}

.mode {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 16px;
  border-radius: var(--mh-radius-sm);
  border: 1px solid var(--mh-line);
  background: #fff;
  transition: all 0.18s ease;
}

.mode:hover {
  transform: translateY(-2px);
  box-shadow: var(--mh-shadow-sm);
}

.mode__label {
  font-size: 14px;
  font-weight: 700;
}

.mode__note {
  font-size: 11px;
  color: var(--mh-muted);
}

@media (max-width: 768px) {
  .game-card {
    flex-direction: column;
    gap: 14px;
  }

  .game-card__cover {
    width: 100%;
    height: 150px;
  }

  .game-card__actions {
    padding-top: 8px;
  }
}
</style>
