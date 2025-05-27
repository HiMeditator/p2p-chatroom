<template>
  <a-row>
    <a-col span="12">
      <ChatView />
    </a-col>
    <a-col span="12">
      <UtilsView />
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import ChatView from "./views/ChatView.vue";
import UtilsView from "./views/UtilsView.vue";
</script>

<style scoped>
/* @media (max-width: 768px) {
  .ant-col {
    flex: 0 0 100%;
    max-width: 100%;
  }
} */
</style>
