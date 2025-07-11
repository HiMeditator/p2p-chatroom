import { ref } from 'vue'
import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'
import type { DialogItem, MessageItem } from '@/types'


export const useDialogStore = defineStore('dialog', () => {
  const dialog = ref<DialogItem[]>([])

  function addDialogItem(me: boolean, msg: MessageItem) {
    dialog.value.push({
      me,
      name: msg.name,
      peerID: msg.peerID,
      contentID: nanoid(),
      content: msg.content,
      time: msg.time
    })
  }

  function clearDialog() {
    dialog.value = []
  }

  return {
    dialog,
    addDialogItem,
    clearDialog
  }
})
