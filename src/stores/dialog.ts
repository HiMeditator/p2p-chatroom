import { ref } from 'vue'
import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'
import { useConnectionStore } from './connection'
import type { DialogItem, MessageItem } from '@/types'


export const useDialogStore = defineStore('dialog', () => {
  const dialog = ref<DialogItem[]>([])

  function addDialogItem(me: boolean, msg: MessageItem) {
    useConnectionStore().setConnectName(msg.peerID, msg.name)
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
