<!-- src/components/memory/simple.vue · 基础模式（6 组词对 / 10 秒识记） -->
<template>
  <MemoryTask :pair-count="6" :memorize-seconds="10" mode="easy" />
</template>

<script setup>
import MemoryTask from './MemoryTask.vue'
</script>
