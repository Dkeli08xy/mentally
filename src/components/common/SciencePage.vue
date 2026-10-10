<template>
  <!-- src/components/common/SciencePage.vue
       三个挑战的「科学原理」科普页共用本组件：
       内容由各页面以数据形式传入，样式与声明区统一。 -->
  <div class="mh-page mh-page--art" :style="{ '--mh-art': 'url(' + art + ')' }">
    <div class="mh-shell mh-shell--narrow">
      <PageHead :title="title" :subtitle="subtitle" back-to="/game" back-label="返回游戏主页">
        <RibbonMark :size="46" tone="light" />
      </PageHead>

      <section class="mh-card">
        <template v-for="(section, i) in sections" :key="i">
          <h2 class="mh-section-title">{{ section.title }}</h2>
          <p v-for="(text, j) in section.paragraphs" :key="j" class="mh-text" v-html="text"></p>
          <ul v-if="section.list" class="list">
            <li v-for="(item, k) in section.list" :key="k" v-html="item"></li>
          </ul>
        </template>

        <!-- 世界精神卫生日公共科普 -->
        <h2 class="mh-section-title">附：关于{{ EVENT.name }}</h2>
        <p class="mh-text">
          「{{ EVENT.name }}」（{{ EVENT.nameEn }}）由世界精神病学协会于 1992 年发起，定在每年
          <strong>10 月 10 日</strong>，{{ EVENT.year }} 年是{{ EVENT.ordinal }}。我国的宣传标志是
          <strong>绿丝带</strong>：绿色象征生命与希望，丝带寓意理解、接纳与陪伴。
        </p>
        <p class="mh-text">{{ EVENT.themeNote }}</p>
        <p class="mh-text">
          心理健康不是「没有心理问题」，而是一种能够应对日常压力、发挥自身能力、与他人建立良好关系并参与社会生活的状态。
          了解心理活动的规律，是善待自己的第一步。
        </p>

        <div class="mh-hotline">
          <div>
            <p class="mh-hotline__number">{{ EVENT.hotline.number }}</p>
            <p class="mh-hotline__label">{{ EVENT.hotline.label }} · {{ EVENT.hotline.note }}</p>
          </div>
          <p class="mh-hotline__label">{{ EVENT.emergencyNote }}</p>
        </div>

        <div class="mh-statement">
          <h4>活动声明</h4>
          <p v-for="(line, i) in EVENT.statement" :key="i">{{ i + 1 }}. {{ line }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import PageHead from './PageHead.vue'
import RibbonMark from './RibbonMark.vue'
import { EVENT } from '../../config/event'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  /** 页面背景插画（import 后的地址） */
  art: { type: String, default: '' },
  /** [{ title, paragraphs: [..], list: [..] }]，文本支持简单的 HTML 片段 */
  sections: { type: Array, default: () => [] },
})
</script>

<style scoped>
.list {
  margin: 10px 0 0;
  padding-left: 20px;
  font-size: 15px;
  line-height: 1.9;
  color: var(--mh-ink-2);
}

.list li + li {
  margin-top: 4px;
}
</style>
