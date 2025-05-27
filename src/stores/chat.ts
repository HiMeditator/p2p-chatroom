import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ChatLog } from '@/types'


export const useChatStore = defineStore('chatLog', () => {
  const chatLog = ref<ChatLog[]>([])

  function addChatLog(log: ChatLog) {
    chatLog.value.push(log)
  }

  function clearChatLog() {
    chatLog.value = []
  }

  return {
    chatLog,
    addChatLog,
    clearChatLog
  }
})
