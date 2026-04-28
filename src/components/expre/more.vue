<!-- src\components\expre\more.vue -->
 <template>
  <div class="micro-expression-page">
    <div class="content-wrapper">
      <div class="header-section">
        <router-link to="/game" class="back-button">
          ← 返回
        </router-link>
        <h1 class="title">微表情概述</h1>
      </div>

      <div class="card">
        <!-- （一）微表情的产生 -->
        <section class="section">
          <h2 class="section-title">（一）微表情的产生</h2>
          <p class="section-text">
            微表情是指持续时间不足 1/5 秒、在面部快速闪现的细微肌肉动作，是揭示个体试图压抑与隐藏的真实内心活动的重要依据，也是识别虚假表达的关键线索。微表情源于外界刺激引发的本能生理反应：人体受到外部刺激后，大脑皮层作为神经调节与控制中枢率先完成信息加工，随即向面部表情相关神经元传递信号；神经元接收并处理指令后，支配面部肌肉产生快速收缩与运动，最终形成微表情。微表情属于广义表情范畴，在无特殊说明时，本文所指 “表情” 为可自主控制、持续时间较长的常规面部表情。美国心理学家保罗·艾克曼经系统研究证实，人类存在七种跨文化普遍的基本情绪，分别对应独特的面部微表情特征：高兴、悲伤、恐惧、愤怒、厌恶、惊讶、轻蔑。与难以完全自主控制的微表情不同，常规面部表情可被意识调控与刻意伪装。在讯问场景中，被讯问对象常通过伪装无辜、愤怒等表情迷惑讯问人员，若讯问者无法精准识别其真实心理状态，极易被虚假表情误导，进而影响讯问工作的有效性与准确性。
          </p>
        </section>

        <!-- （二）微表情的特征 -->
        <section class="section">
          <h2 class="section-title">（二）微表情的特征</h2>
          <p class="section-text">
            由产生机制可知，微表情与可控的常规表情相比，具备四项核心特征：
          </p>
        </section>

        <section class="section">
          <h3 class="feature-title">1. 客观性</h3>
          <p class="section-text">
            微表情是大脑皮层受刺激后产生的外在生理表现，虽呈现时间极短，却真实客观存在，是心理状态变化在面部的直接映射。自艾克曼首次提出微表情概念以来，其客观存在性已逐步得到学界与公众认可。2009 年 9 月，中国科学院心理研究所所长付小兰牵头组建专项研究团队，围绕微表情与人类情绪机制、无意识心理状态的关联展开系统研究，进一步证实了微表情的客观真实性。
          </p>
        </section>

        <section class="section">
          <h3 class="feature-title">2. 自发性</h3>
          <p class="section-text">
            微表情是外界刺激与神经生理机制共同作用下的自然产物，属于本能应激反应，不受主观意识控制与刻意隐瞒，具备不可伪造性，这是其与可伪装常规表情最本质的区别。微表情是大脑皮层接收刺激后最初始的本能反应，无法被意识修饰。神经研究表明：个体真实愤怒时，双侧面部表情高度同步；刻意伪装愤怒时，左侧面部表情滞后于右侧，甚至出现左右明显不对称的情况。
          </p>
        </section>

        <section class="section">
          <h3 class="feature-title">3. 真实性</h3>
          <p class="section-text">
            微表情能够不受面部肌肉主观控制，精准映射个体最真实的情绪与心理状态，不同刺激信号对应不同的微表情表现。这一特征是将微表情用于判断讯问对象陈述真实性的核心前提，讯问人员可依托微表情，更准确地把握被讯问者的真实心理活动。
          </p>
        </section>

        <section class="section">
          <h3 class="feature-title">4. 瞬间性</h3>
          <p class="section-text">
            微表情持续时间极短，通常不足 1/5 秒，未经专业训练者难以在自然状态下清晰捕捉。通过系统训练可显著提升微表情察觉与情绪判读能力；在讯问场景中，也可借助录音录像设备慢放回放，实现对微表情的精准捕捉与分析。
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.micro-expression-page {
  min-height: 100vh;
  font-family: 'Noto Sans SC', sans-serif;
  background-image: url('../../assets/images/game/表情_背景.webp');
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

.feature-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin: 0 0 10px 0;
}

.section-text {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
  margin: 8px 0;
}

@media (max-width: 768px) {
  .micro-expression-page {
    background-image: url('../../assets/images/game/表情_移动.webp');
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

  .feature-title {
    font-size: 15px;
    color: #222;
  }

  .section-text {
    font-size: 14px;
    color: #333;
    line-height: 1.7;
  }
}
</style>