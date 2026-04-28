<!-- src\components\memory\more.vue -->
<template>
  <div class="memory-page">
    <div class="content-wrapper">
      <div class="header-section">
        <router-link to="/game" class="back-button">
          ← 返回
        </router-link>
        <h1 class="title">记忆衰减曲线</h1>
      </div>

      <div class="card">
        <!-- 一、记忆衰减曲线概述 -->
        <section class="section">
          <h2 class="section-title">一、记忆衰减曲线概述</h2>
          <p class="section-text">
            记忆衰减曲线是基于艾宾浩斯遗忘规律与指数衰减模型构建的数学描述，用于量化呈现人类记忆内容随时间推移而逐步丢失的动态过程。它以时间为横轴、记忆保留率为纵轴，直观反映信息从识记到遗忘的速率变化，是认知心理学中解释记忆规律、指导高效学习的核心依据。
          </p>
        </section>

        <!-- 二、科学原理与数学模型 -->
        <section class="section">
          <h2 class="section-title">二、科学原理与数学模型</h2>
          <p class="section-text">
            记忆的遗忘过程并非匀速，而是先快后慢，符合指数衰减函数：保留率 = 初始正确率 × e^(-t/k)
          </p>
          <p class="section-text">
            e：自然常数（约 2.718）
          </p>
          <p class="section-text">
            k：遗忘速率参数
          </p>
          <p class="section-text">
            t：时间间隔
          </p>
          <p class="section-text">
            该模型可精准拟合个体在不同延时时下的记忆表现，生成专属记忆衰减曲线。
          </p>
        </section>

        <!-- 三、本项目记忆衰减模块设计 -->
        <section class="section">
          <h2 class="section-title">三、本项目记忆衰减模块设计</h2>
          <p class="section-text">
            任务范式采用识记 — 延时 — 再认标准实验流程：先让被试学习词对信息，分别在0秒，20秒、1分钟、2分钟三个延时节点进行匹配测试，记录各时间点记忆正确率。
          </p>
          <p class="section-text">
            数据采集记录每个延时节点的记忆保留率，作为曲线拟合的核心数据。
          </p>
          <p class="section-text">
            可视化呈现基于实测数据绘制个性化指数衰减曲线，直观展示被试的记忆遗忘速度，帮助理解 “及时复习” 的科学依据，为学习策略优化提供量化参考。
          </p>
          <p class="section-text">
            科普价值以游戏化方式还原经典记忆实验，破除 “记忆靠天赋” 的认知误区，让大学生直观理解记忆可量化、遗忘有规律，兼具科学性与教育意义。
          </p>
        </section>

        <!-- 四、权威合规声明 -->
        <section class="section">
          <h2 class="section-title">四、权威合规声明</h2>
          <p class="section-text">
            本记忆衰减曲线为心理建模科普工具，基于认知心理学经典范式设计，仅用于展示记忆规律与学习参考，不构成记忆力评估、智力测验或临床诊断；数据匿名采集，仅用于个人历史查看与科普研究。
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.memory-page {
  min-height: 100vh;
  font-family: 'Noto Sans SC', sans-serif;
  background-image: url('../../assets/images/game/记忆_背景.webp');
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
  .memory-page {
    background-image: url('../../assets/images/game/记忆_移动.webp');
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