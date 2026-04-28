<!-- src\view\load.vue -->
<template>
  <router-link to="/home">
    <div class="bg"></div>
    <img src="../assets/images/load/sun.png" alt="太阳" class="sun-icon" />
    <div class="text-group">
      <h1 class="title">"525心理活动"</h1>
      <p class="subtitle">情绪乐园</p>
    </div>
    <p class="tip">点击任意位置进入活动详情</p>
  </router-link>
</template>

<script setup>
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: url('../assets/images/load/bg.png') center center / cover no-repeat;
  z-index: 0;
}

.sun-icon {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: auto;
  z-index: 1;
}

.text-group {
  position: absolute;
  top: 32%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 1;
}

.title {
  font-size: 4rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  margin: 0 0 16px 0;
}

.subtitle {
  font-size: 2.2rem;
  color: #ffffff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  margin: 0;
}

.tip {
  position: absolute;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.4rem;
  color: #ffffff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  z-index: 1;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .sun-icon {
    width: 70px;
  }

  .title {
    font-size: 3rem;
  }

  .subtitle {
    font-size: 1.8rem;
  }

  .tip {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .sun-icon {
    width: 60px;
    top: 18%;
  }

  .text-group {
    top: 30%;
  }

  .title {
    font-size: 2.2rem;
  }

  .subtitle {
    font-size: 1.4rem;
  }

  .tip {
    font-size: 1rem;
    bottom: 12%;
  }
}

@media (max-width: 320px) {
  .sun-icon {
    width: 50px;
  }

  .title {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }

  .tip {
    font-size: 0.9rem;
  }
}
</style>