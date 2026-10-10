<!-- src/components/expre/hard.vue · 进阶模式（6 类情绪 / 48 题） -->
<template>
  <ExpreTask
    mode="hard"
    :emotions="EMOTIONS_HARD"
    :pool-config="{ imgPerEmotion: 4, gifPerEmotion: 3, videoPerEmotion: 1, extraGifs: 0 }"
  />
</template>

<script setup>
import ExpreTask from './ExpreTask.vue'
import { EMOTIONS_HARD } from '../../config/emotions'
</script>
