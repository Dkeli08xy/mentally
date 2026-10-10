<template>
  <!-- src/view/Home.vue · 活动首页 -->
  <div class="mh-page home">
    <div class="mh-shell">
      <!-- 主视觉 -->
      <section class="hero mh-fade-up">
        <div class="hero__left">
          <span class="mh-badge">{{ EVENT.badge }} {{ EVENT.dateLabel }}</span>
          <h1 class="hero__title">{{ EVENT.year }} 年{{ EVENT.ordinal }}{{ EVENT.name }}</h1>
          <p class="hero__slogan">{{ EVENT.slogan }}</p>
          <p class="hero__desc">
            {{ EVENT.subSlogan }}。三个小挑战取材于实验心理学与认知心理学的经典范式，
            用游戏的方式把「看不见的心理活动」变成看得见的数字。
          </p>
          <div class="hero__meta">
            <span>{{ EVENT.dateText }}</span>
            <span>·</span>
            <span>{{ EVENT.themeText }}</span>
          </div>
        </div>
        <div class="hero__right">
          <RibbonMark :size="104" />
          <p class="hero__ribbon-note">绿丝带 · 中国精神卫生标志</p>
        </div>
      </section>

      <!-- 三个入口 -->
      <section class="entries">
        <router-link v-for="item in entries" :key="item.route" :to="item.route" class="entry mh-card">
          <span class="entry__icon">{{ item.icon }}</span>
          <h3 class="entry__title">{{ item.title }}</h3>
          <p class="entry__desc">{{ item.desc }}</p>
          <span class="entry__more">进入 →</span>
        </router-link>
      </section>

      <!-- 三个挑战快捷入口 -->
      <section class="mh-card quick">
        <h2 class="mh-section-title">三个心理挑战</h2>
        <div class="quick__list">
          <div v-for="game in GAMES" :key="game.key" class="quick__item">
            <div class="quick__head">
              <span class="quick__icon" :style="{ background: game.accent + '1f', color: game.accent }">{{ game.icon }}</span>
              <div>
                <p class="quick__name">{{ game.name }}</p>
                <p class="quick__tagline">{{ game.tagline }}</p>
              </div>
            </div>
            <div class="quick__actions">
              <router-link :to="game.easy.route" class="mh-btn mh-btn--primary mh-btn--sm">{{ game.easy.label }}</router-link>
              <router-link :to="game.hard.route" class="mh-btn mh-btn--ghost mh-btn--sm">{{ game.hard.label }}</router-link>
            </div>
          </div>
        </div>
      </section>

      <!-- 校内免费咨询（重点标注） -->
      <section class="mh-card campus-care">
        <div class="campus-care__main">
          <span class="campus-care__badge">免费 · 保密</span>
          <h2 class="campus-care__title">{{ EVENT.counseling.name }}</h2>
          <p class="campus-care__desc">
            面向{{ '全体在校学生' }}免费开放，不需要医保、不产生费用：学业压力、人际相处、情绪低落、
            对未来迷茫，都可以来聊。走进心理中心不是「有问题」，而是对自己状态的一次照顾。
          </p>
          <p class="campus-care__hours">开放时间：{{ EVENT.counseling.hoursText }}</p>
          <div class="campus-care__actions">
            <router-link to="/men" class="mh-btn mh-btn--primary mh-btn--sm">查看预约通道</router-link>
            <span class="campus-care__tip">预约二维码与更多说明见「世界精神卫生日介绍」页</span>
          </div>
        </div>
      </section>

      <!-- 求助渠道 -->
      <section class="mh-hotline">
        <div>
          <p class="mh-hotline__number">{{ EVENT.hotline.number }}</p>
          <p class="mh-hotline__label">{{ EVENT.hotline.label }} · {{ EVENT.hotline.note }}</p>
        </div>
        <p class="mh-hotline__label">{{ EVENT.emergencyNote }}</p>
      </section>

      <!-- 声明 -->
      <section class="mh-statement">
        <h4>活动声明</h4>
        <p v-for="(line, i) in EVENT.statement" :key="i">{{ i + 1 }}. {{ line }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { EVENT, GAMES } from '../config/event'
import RibbonMark from '../components/common/RibbonMark.vue'

const entries = [
  {
    route: '/men',
    icon: '🌿',
    title: '世界精神卫生日介绍',
    desc: '节日起源、绿丝带的含义、年度主题与校园活动安排',
  },
  {
    route: '/game',
    icon: '🎮',
    title: '心理趣味挑战',
    desc: '反应速度 · 记忆保持 · 情绪识别，三组可量化的心理小实验',
  },
  {
    route: '/user',
    icon: '📈',
    title: '我的记录',
    desc: '查看历史成绩、稳定性变化与科学解读，随时清空本地数据',
  },
]
</script>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 30px 28px;
  border-radius: 22px;
  background: linear-gradient(135deg, #ffffff 0%, var(--mh-primary-soft) 100%);
  border: 1px solid var(--mh-line);
  box-shadow: var(--mh-shadow);
}

.hero__left {
  flex: 1;
  min-width: 0;
}

.hero__title {
  margin-top: 14px;
  font-size: clamp(22px, 3.4vw, 32px);
  font-weight: 800;
  color: var(--mh-primary-dark);
  letter-spacing: 1px;
}

.hero__slogan {
  margin-top: 8px;
  font-size: 17px;
  font-weight: 600;
  color: var(--mh-ink);
}

.hero__desc {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.9;
  color: var(--mh-ink-2);
}

.hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  font-size: 13px;
  color: var(--mh-muted);
}

.hero__right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.hero__ribbon-note {
  font-size: 12px;
  color: var(--mh-muted);
}

.entries {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(248px, 1fr));
  gap: 18px;
  margin-top: 20px;
}

.entry {
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.entry:hover {
  transform: translateY(-6px);
  border-color: var(--mh-primary-light);
  box-shadow: var(--mh-shadow);
}

.entry__icon {
  font-size: 28px;
}

.entry__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--mh-primary-dark);
}

.entry__desc {
  flex: 1;
  font-size: 13px;
  line-height: 1.8;
  color: var(--mh-muted);
}

.entry__more {
  font-size: 13px;
  font-weight: 600;
  color: var(--mh-primary);
}

.quick {
  margin-top: 20px;
}

.quick__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
}

.quick__item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: var(--mh-radius-sm);
  background: var(--mh-surface-2);
  border: 1px solid var(--mh-line);
}

.quick__head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quick__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 20px;
  flex-shrink: 0;
}

.quick__name {
  font-size: 15px;
  font-weight: 700;
  color: var(--mh-ink);
}

.quick__tagline {
  font-size: 12px;
  color: var(--mh-muted);
}

.quick__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 校内免费心理咨询：首页重点标注卡片 */
.campus-care {
  margin-top: 20px;
  background: linear-gradient(120deg, #ffffff 0%, var(--mh-primary-soft) 100%);
  border-color: var(--mh-primary-light);
}

.campus-care__badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 999px;
  background: var(--mh-primary);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
}

.campus-care__title {
  margin-top: 10px;
  font-size: 19px;
  font-weight: 700;
  color: var(--mh-primary-dark);
}

.campus-care__desc {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.9;
  color: var(--mh-ink-2);
}

.campus-care__hours {
  margin-top: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--mh-primary-dark);
}

.campus-care__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.campus-care__tip {
  font-size: 12px;
  color: var(--mh-muted);
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 22px 18px;
  }

  .hero__right {
    align-self: center;
  }
}
</style>
