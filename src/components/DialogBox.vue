<template>
  <div class="dialog-box">
    <div v-for="(log, index) in chatLog" :key="log.contentID" class="dialog-item">
      <UserDialog :dialog="log" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ChatLog } from '@/types'
import { storeToRefs } from 'pinia'
import UserDialog from './dialog/UserDialog.vue'

const chatLog = ref<ChatLog[]>()
chatLog.value = [
  {
    me: true,
    name: 'Jack',
    peerID: '0001',
    contentID: '0001',
    content: 'Hi, I am Jack'
  },
  {
    me: false,
    name: 'Tom',
    peerID: '0002',
    contentID: '0002',
    content: 'Hi, I am Tom.\nHow are you?'
  }
]
</script>

<style scoped>
.dailog-box {
  overflow-y: auto;
  scrollbar-width: thin;
}
</style>