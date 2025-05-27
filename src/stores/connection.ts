import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useDialogStore } from './dialog'
import { usePeerStore } from './peer'
import type { DataConnection } from 'peerjs'
import type { ConnectionItem, MessageItem } from '@/types'

export const useConnectionStore = defineStore('connection', () => {
  const connectList = ref<ConnectionItem[]>([]);

  function addConnect(conn: DataConnection) {
    connectList.value.push({
      name: 'unknown',
      id: conn.peer,
      selected: false,
      conn: conn
    })
  }

  function sendMessage(message: string) {
    const messageItem: MessageItem = {
      name: usePeerStore().name,
      peerID: usePeerStore().peerID,
      content: message,
      time: new Date().toLocaleTimeString()
    }
    useDialogStore().addDialogItem(true, messageItem);
    for(const conn of connectList.value){
      if(conn.selected){
        conn.conn.send(messageItem)
        conn.selected = false
      }
    }
  }

  return {
    connectList,
    addConnect,
    sendMessage
  }
})
