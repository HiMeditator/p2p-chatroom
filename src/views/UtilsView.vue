<template>
<div class="utils-view">
  <ConnectPanel />
  <VideoPanel />
</div>
</template>

<script setup lang="ts">
import ConnectPanel from '@/components/ConnectPanel.vue';
import VideoPanel from '@/components/VideoPanel.vue';
</script>

<style scoped>
.utils-view {
  padding: 20px 20px;
  height: 100vh;
  overflow: auto;
}
</style>

