<!-- src/components/expre/simple.vue · 基础模式（5 类情绪 / 36 题） -->
<template>
  <ExpreTask
    mode="easy"
    :emotions="EMOTIONS_EASY"
    :pool-config="{ imgPerEmotion: 6, gifPerEmotion: 1, videoPerEmotion: 0, extraGifs: 1 }"
  />
</template>

<script setup>
import ExpreTask from './ExpreTask.vue'
import { EMOTIONS_EASY } from '../../config/emotions'
</script>
