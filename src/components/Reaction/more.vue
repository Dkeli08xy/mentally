<!-- src\components\Reaction\more.vue -->
<template>
  <div class="reaction-more-page">
    <div class="content-wrapper">
      <div class="header-section">
        <router-link to="/game" class="back-button">
          ← 返回
        </router-link>
        <h1 class="title">反应时</h1>
      </div>

      <div class="card">
        <section class="section">
          <h2 class="section-title">一、权威定义（实验心理学标准表述）</h2>
          <p class="section-text">
            反应时（Reaction Time, RT），指从特定刺激呈现到被试做出明确外显反应之间的精确时间间隔，是衡量人类感知觉加工、注意分配、决策速度、动作执行的核心行为指标，由唐德斯（F.C. Donders）于 19 世纪中叶建立实验室测量范式，为认知心理学奠基方法之一。
          </p>
        </section>

        <section class="section">
          <h2 class="section-title">二、本项目反应时挑战的权威定位</h2>
          <p class="section-text">
            任务类型：辨别反应时（C 类反应时）—— 单一目标刺激（绿色）需反应，干扰刺激（其他颜色）不反应，测量刺激辨别 + 动作触发的时间成本。
          </p>
          <p class="section-text">
            测量逻辑：刺激出现时刻→视觉编码→特征辨别→决策→运动执行→按键响应，全程精确到毫秒。
          </p>
          <p class="section-text">
            数据属性：客观、连续、可建模，服从正态分布，可做群体参照与个体差异分析。
          </p>
          <p class="section-text">
            伦理边界：仅科普与量化体验，不做病理判断、不替代心理评估、不涉及敏感信息采集。
          </p>
        </section>

        <!-- 三、标准流程 -->
        <section class="section">
          <h2 class="section-title">三、标准流程（权威范式简化版）</h2>
          <p class="section-text">
            指导语标准化：明确 “仅在绿色出现时立即按键，其他颜色不做反应”。
          </p>
          <p class="section-text">
            刺激呈现：随机色块序列，目标为绿色，其余为干扰色。
          </p>
          <p class="section-text">
            数据采集：逐试次记录试次序号、反应时、反应正确性。
          </p>
          <p class="section-text">
            可视化：正态分布直方 — 折线图，标注个体在大学生群体中的相对水平。
          </p>
        </section>

        <!-- 四、核心指标与解释 -->
        <section class="section">
          <h2 class="section-title">四、核心指标与解释（权威口径）</h2>
          <p class="section-text">
            反应时：越小代表信息加工越快、注意越集中、动作越敏捷。
          </p>
          <p class="section-text">
            正确率：反映任务遵守度与辨别稳定性，错误率过高提示注意波动。
          </p>
          <p class="section-text">
            分布特征：健康大学生群体反应时呈正态分布，极端快 / 慢占比低，中等速度占比最高。
          </p>
        </section>

        <!-- 五、合规声明 -->
        <section class="section">
          <h2 class="section-title">五、合规声明（必写权威表述）</h2>
          <p class="section-text">
            本反应时挑战为心理建模科普游戏，基于实验心理学经典范式设计，仅用于展示心理活动可量化特征，不构成任何心理诊断、健康评估或临床结论；数据匿名采集，仅用于历史查询与科普研究，严格遵循《个人信息保护法》相关要求。
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.reaction-more-page {
  min-height: 100vh;
  font-family: 'Noto Sans SC', sans-serif;
  background-image: url('../../assets/images/game/反应_背景.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  padding: 60px 40px;
  box-sizing: border-box;
}

.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  margin-bottom: 32px;
  position: relative;
  flex-wrap: wrap;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background-color: rgba(107, 139, 217, 0.85);
  color: white;
  text-decoration: none;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 500;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.back-button:hover {
  background-color: #5a78c2;
  transform: translateX(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: #222;
  margin: 0;
  flex-shrink: 0;
}

.header-section::after {
  display: none;
}

.card {
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.section {
  margin-bottom: 32px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin: 0 0 12px 0;
}

.section-text {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
  margin: 8px 0;
}

@media (max-width: 768px) {
  .reaction-more-page {
    background-image: url('../../assets/images/game/反应_移动.webp');
    padding: 20px 10px;
    background-size: cover;
    background-position: top center;
    background-attachment: scroll;
  }

  .content-wrapper {
    max-width: 100%;
  }

  .header-section {
    gap: 12px;
    margin-bottom: 20px;
  }

  .back-button {
    padding: 6px 14px;
    font-size: 13px;
  }

  .title {
    font-size: 26px;
  }

  .card {
    background: transparent;
    padding: 16px;
    box-shadow: none;
    border-radius: 0;
  }

  .section-title {
    font-size: 16px;
    color: #222;
  }

  .section-text {
    font-size: 14px;
    color: #333;
    line-height: 1.7;
  }
}
</style>