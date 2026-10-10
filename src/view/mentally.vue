<template>
  <!-- src/view/mentally.vue · 世界精神卫生日介绍（活动信息 / 科普 / 误区 / 心理中心预约） -->
  <div class="mh-page">
    <div class="mh-shell">
      <PageHead :title="EVENT.name + ' · 活动介绍'" :subtitle="EVENT.dateText" back-to="/home" back-label="返回首页" />

      <!-- 一、节日与年度主题 -->
      <section class="mh-card">
        <div class="intro__head">
          <RibbonMark :size="64" />
          <div>
            <h2 class="mh-title">{{ EVENT.year }} 年{{ EVENT.ordinal }}{{ EVENT.name }}</h2>
            <p class="mh-subtitle">{{ EVENT.dateText }} · 宣传标志：绿丝带</p>
          </div>
        </div>

        <div class="theme-box">
          <span class="theme-box__label">{{ EVENT.year }} 年度主题</span>
          <p class="theme-box__text">「{{ EVENT.themeText }}」</p>
          <p class="theme-box__from">{{ EVENT.themeFrom }}</p>
        </div>

        <p class="mh-text">
          「世界精神卫生日」（{{ EVENT.nameEn }}）由世界精神病学协会于 1992 年发起，定在每年
          <strong class="mh-strong">10 月 10 日</strong>，{{ EVENT.year }} 年是{{ EVENT.ordinal }}，
          目的是让精神卫生知识走进日常、让需要帮助的人更容易开口、也更容易找到支持。我国的宣传标志是
          <strong class="mh-strong">绿丝带</strong>：绿色象征生命与希望，丝带寓意理解、接纳与陪伴。
        </p>

        <div class="meaning">
          <div class="meaning__item">
            <span class="mh-tag">广义</span>
            <p>
              精神卫生是<strong>促进整体心理健康</strong>：让人能应对日常压力、发挥自己的能力、
              与他人建立良好关系、参与并享受生活。它不是「没有问题」才算好，而是一种可以被维护的状态。
            </p>
          </div>
          <div class="meaning__item">
            <span class="mh-tag mh-tag--accent">狭义</span>
            <p>
              精神卫生也包括对精神心理问题的<strong>预防、治疗与康复</strong>：早识别、早求助、按医嘱治疗、
              在支持中恢复社会功能。两者并不冲突——日常的心理保健做得好，需要治疗的风险也会更低。
            </p>
          </div>
        </div>

        <div class="intro__facts">
          <div v-for="fact in facts" :key="fact.label" class="intro__fact">
            <span class="intro__fact-label">{{ fact.label }}</span>
            <span class="intro__fact-value">{{ fact.value }}</span>
          </div>
        </div>
      </section>

      <!-- 二、同期校园活动 -->
      <section class="mh-card">
        <h2 class="mh-section-title">10 月 10 日 · 同期校园活动</h2>
        <div class="activity-list">
          <article v-for="act in EVENT.activities" :key="act.name" class="activity">
            <div class="activity__head">
              <h3 class="activity__name">{{ act.name }}</h3>
              <span class="mh-tag">{{ act.tag }}</span>
            </div>
            <p class="activity__date">{{ act.date }}</p>
            <p class="activity__note">{{ act.note }}</p>
          </article>
        </div>
        <p class="mh-text mh-muted">活动安排以学校正式通知为准，若时间地点调整，请以最新通知为准。</p>
      </section>

      <!-- 三、常见误区 -->
      <section class="mh-card">
        <h2 class="mh-section-title">关于精神心理的常见误区</h2>
        <p class="mh-text">很多犹豫并不是因为「不需要帮助」，而是因为一些流传很广的误解。先看清它们，再决定要不要开口。</p>

        <ul class="myths">
          <li v-for="(item, i) in myths" :key="i" class="myth">
            <p class="myth__wrong"><span class="myth__icon">✕</span>误区：{{ item.myth }}</p>
            <p class="myth__right"><span class="myth__icon">✓</span>事实：{{ item.fact }}</p>
          </li>
        </ul>
      </section>

      <!-- 四、费用与政策 -->
      <section class="mh-card">
        <h2 class="mh-section-title">心理咨询的费用与政策</h2>

        <div class="highlight">
          <p class="highlight__title">在校学生：校内心理健康中心免费咨询</p>
          <p>
            我校心理健康中心面向<strong>全体在校学生免费开放</strong>，不需要医保、不产生费用，
            也不需要任何「资格」——学业压力、人际相处、情绪低落、对未来迷茫，都可以来聊。
          </p>
        </div>

        <p class="mh-text">
          在社会层面，精神心理服务也在变得更可及。2024 年 11 月，国家医保局印发
          <strong class="mh-strong">《精神治疗类医疗服务价格项目立项指南（试行）》</strong>，
          统一规范精神治疗类价格项目，区分「心理治疗」（按小时计费）与「心理咨询」（按次收费），
          并明确两者不可同时收费，为减轻费用负担、推动相关服务纳入医保支付提供了政策基础。
        </p>
        <p class="mh-text mh-muted">
          目前各地推进进度不一致，门诊报销范围与比例请以当地医保部门、就诊医院公布的信息为准。
          如果暂时不方便或不确定，可以先使用下面的免费渠道。
        </p>

        <div class="channels">
          <div class="channel">
            <p class="channel__title">校内心理健康中心</p>
            <p class="channel__desc">免费 · 保密 · 可预约</p>
            <p class="channel__meta">{{ EVENT.counseling.hoursText }}</p>
          </div>
          <div class="channel">
            <p class="channel__title">{{ EVENT.hotline.number }}</p>
            <p class="channel__desc">{{ EVENT.hotline.label }}</p>
            <p class="channel__meta">{{ EVENT.hotline.note }}</p>
          </div>
        </div>
        <p class="mh-text mh-muted">{{ EVENT.emergencyNote }}</p>
      </section>

      <!-- 五、预约通道（二维码容器 + 下载按钮，路径可在 config/event.js 中配置） -->
      <section class="mh-card">
        <h2 class="mh-section-title">心理健康中心 · 预约通道</h2>
        <div class="booking">
          <div class="booking__qr">
            <img v-if="EVENT.counseling.qrImage" :src="EVENT.counseling.qrImage" :alt="EVENT.counseling.name + '预约二维码'" />
            <div v-else class="booking__qr-empty">
              <span class="booking__qr-icon">▣</span>
              <p>{{ EVENT.counseling.qrPlaceholder }}</p>
            </div>
          </div>

          <div class="booking__info">
            <p class="booking__name">{{ EVENT.counseling.name }}</p>
            <p class="booking__subtitle">{{ EVENT.counseling.subtitle }}</p>

            <ul class="booking__hours">
              <li v-for="(h, i) in EVENT.counseling.hours" :key="i">
                <span class="booking__hours-label">{{ h.label }}</span>
                <span class="booking__hours-time">{{ h.time }}</span>
              </li>
            </ul>

            <p v-if="EVENT.counseling.location" class="booking__meta">地址：{{ EVENT.counseling.location }}</p>
            <p v-if="EVENT.counseling.phone" class="booking__meta">预约电话：{{ EVENT.counseling.phone }}</p>

            <div class="booking__actions">
              <a
                class="mh-btn mh-btn--primary"
                :class="{ 'mh-btn--disabled': !EVENT.counseling.qrImage }"
                :href="EVENT.counseling.qrImage || undefined"
                :download="EVENT.counseling.qrImage ? EVENT.counseling.qrFileName : undefined"
                @click="onDownload"
              >
                ⬇ 下载预约二维码
              </a>
              <span class="booking__tip">{{ EVENT.counseling.qrTip }}</span>
            </div>

            <p class="booking__hint">{{ EVENT.counseling.qrHint }}</p>
          </div>
        </div>

        <p class="mh-text booking__note">{{ EVENT.counseling.note }}</p>
      </section>

      <section class="mh-statement">
        <h4>活动声明</h4>
        <p v-for="(line, i) in EVENT.statement" :key="i">{{ i + 1 }}. {{ line }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { EVENT } from '../config/event'
import PageHead from '../components/common/PageHead.vue'
import RibbonMark from '../components/common/RibbonMark.vue'

const facts = [
  { label: '发起年份', value: '1992 年' },
  { label: '活动日期', value: '每年 10 月 10 日' },
  { label: '本年度', value: EVENT.ordinal },
  { label: '宣传标志', value: '绿丝带' },
]

/** 常见误区：用「事实」对冲日常流传的偏见式说法 */
const myths = [
  {
    myth: '心理困扰是「想太多」「太脆弱」，扛一扛就过去了。',
    fact: '心理状态受睡眠、压力、身体状况、环境变化等多重因素影响，任何人都有可能遇到。它更像感冒发烧，需要的是被认真对待，而不是被指责。',
  },
  {
    myth: '去心理健康中心，就等于「有心理疾病」。',
    fact: '来访的同学大多只是遇到学业、人际或情绪上的困扰。把困扰说出来，是对自己状态的照顾，和「有病」没有必然关系；越早聊，越省力。',
  },
  {
    myth: '心理咨询就是找人聊天、听人给建议。',
    fact: '咨询是有专业设置与伦理规范的过程。咨询师不会替你做决定，也不会简单地说「你应该怎样」，而是陪你一起看清处境、找到你自己的办法。',
  },
  {
    myth: '咨询师会评判我，还会把我说的告诉别人。',
    fact: '尊重与保密是心理工作的职业伦理底线。只有在依法需要保护生命安全等特殊情形下才会突破保密，并且会尽可能与你沟通。',
  },
  {
    myth: '聊一次就能彻底解决，没效果就是没用。',
    fact: '改变通常需要几次到十几次的过程，像锻炼身体一样，效果来自持续投入；中途觉得「没用」也可以和咨询师直接讨论，这本身就是有用的素材。',
  },
  {
    myth: '只有严重到撑不住了才需要求助。',
    fact: '任何让你困扰的情绪都值得被认真对待。早一点说出口，往往能避免小困扰滚成大问题，也能少走很多弯路。',
  },
]

/** 未配置二维码路径时，点击下载给出明确提示而不是静默失败 */
const onDownload = (e) => {
  if (!EVENT.counseling.qrImage) {
    e.preventDefault()
    ElMessage.info('预约二维码尚未配置：请在 src/config/event.js 的 counseling.qrImage 中填写图片路径')
  }
}
</script>

<style scoped>
.intro__head {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 14px;
}

.theme-box {
  padding: 16px 20px;
  border-radius: var(--mh-radius-sm);
  background: linear-gradient(120deg, var(--mh-primary-soft-2), #fff);
  border: 1px dashed var(--mh-primary-light);
  margin-bottom: 16px;
}

.theme-box__label {
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--mh-muted);
}

.theme-box__text {
  margin-top: 6px;
  font-size: 22px;
  font-weight: 800;
  color: var(--mh-primary-dark);
  letter-spacing: 2px;
}

.theme-box__from {
  margin-top: 4px;
  font-size: 12px;
  color: var(--mh-muted);
}

.meaning {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.meaning__item {
  padding: 14px 16px;
  border-radius: var(--mh-radius-sm);
  background: var(--mh-surface-2);
  border: 1px solid var(--mh-line);
}

.meaning__item p {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.85;
  color: var(--mh-ink-2);
}

.intro__facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.intro__fact {
  padding: 12px;
  border-radius: var(--mh-radius-sm);
  background: var(--mh-surface-2);
  border: 1px solid var(--mh-line);
  text-align: center;
}

.intro__fact-label {
  display: block;
  font-size: 12px;
  color: var(--mh-muted);
  margin-bottom: 4px;
}

.intro__fact-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--mh-primary-dark);
}

.activity-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
  margin-bottom: 12px;
}

.activity {
  padding: 16px;
  border-radius: var(--mh-radius-sm);
  background: var(--mh-surface-2);
  border: 1px solid var(--mh-line);
}

.activity__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.activity__name {
  font-size: 16px;
  font-weight: 700;
  color: var(--mh-ink);
}

.activity__date {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--mh-primary);
}

.activity__note {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--mh-muted);
}

.myths {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.myth {
  padding: 14px 16px;
  border-radius: var(--mh-radius-sm);
  background: #fff;
  border: 1px solid var(--mh-line);
}

.myth__wrong,
.myth__right {
  font-size: 14px;
  line-height: 1.85;
}

.myth__wrong {
  color: #a4553b;
}

.myth__right {
  margin-top: 8px;
  color: var(--mh-ink-2);
}

.myth__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 6px;
  border-radius: 50%;
  font-size: 11px;
  color: #fff;
  background: #d9694a;
  vertical-align: 1px;
}

.myth__right .myth__icon {
  background: var(--mh-primary);
}

.highlight {
  padding: 16px 18px;
  border-radius: var(--mh-radius-sm);
  background: linear-gradient(120deg, var(--mh-primary-soft), #fff);
  border-left: 4px solid var(--mh-primary);
  margin-bottom: 14px;
}

.highlight__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--mh-primary-dark);
  margin-bottom: 6px;
}

.highlight p {
  font-size: 14px;
  line-height: 1.85;
  color: var(--mh-ink-2);
}

.channels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
  margin: 16px 0 10px;
}

.channel {
  padding: 14px 16px;
  border-radius: var(--mh-radius-sm);
  background: var(--mh-surface-2);
  border: 1px solid var(--mh-line);
}

.channel__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--mh-primary-dark);
}

.channel__desc {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--mh-ink-2);
}

.channel__meta {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--mh-muted);
}

.booking {
  display: flex;
  gap: 22px;
  align-items: flex-start;
  margin-top: 14px;
  flex-wrap: wrap;
}

.booking__qr {
  width: 180px;
  height: 180px;
  flex-shrink: 0;
  border-radius: var(--mh-radius-sm);
  border: 1px solid var(--mh-line);
  background: #fff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.booking__qr img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.booking__qr-empty {
  width: 100%;
  height: 100%;
  border: 2px dashed var(--mh-primary-light);
  border-radius: var(--mh-radius-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--mh-primary);
  font-size: 13px;
  background: var(--mh-primary-soft-2);
}

.booking__qr-icon {
  font-size: 30px;
  opacity: 0.6;
}

.booking__info {
  flex: 1;
  min-width: 240px;
}

.booking__name {
  font-size: 18px;
  font-weight: 700;
  color: var(--mh-ink);
}

.booking__subtitle {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--mh-primary);
}

.booking__hours {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.booking__hours li {
  padding: 8px 12px;
  border-radius: var(--mh-radius-sm);
  background: var(--mh-surface-2);
  border: 1px solid var(--mh-line);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.booking__hours-label {
  font-size: 11px;
  color: var(--mh-muted);
}

.booking__hours-time {
  font-size: 14px;
  font-weight: 700;
  color: var(--mh-primary-dark);
}

.booking__meta {
  margin-top: 10px;
  font-size: 13px;
  color: var(--mh-ink-2);
}

.booking__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.booking__tip {
  font-size: 12px;
  color: var(--mh-muted);
}

.booking__hint {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--mh-muted);
}

.booking__note {
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: var(--mh-radius-sm);
  background: var(--mh-primary-soft-2);
  border: 1px dashed var(--mh-primary-light);
}

.mh-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 768px) {
  .intro__head {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .theme-box__text {
    font-size: 19px;
  }

  .booking__qr {
    width: 100%;
    height: 170px;
  }
}
</style>
