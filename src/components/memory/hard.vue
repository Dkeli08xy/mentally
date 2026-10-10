<!-- src/components/memory/hard.vue · 进阶模式（8 组词对 / 15 秒识记） -->
<template>
  <MemoryTask :pair-count="8" :memorize-seconds="15" mode="hard" />
</template>

<script setup>
import MemoryTask from './MemoryTask.vue'
</script>
