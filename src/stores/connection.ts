import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useDialogStore } from './dialog'
import { usePeerStore } from './peer'
import type { DataConnection } from 'peerjs'
import type { ConnectionItem, MessageItem } from '@/types'
import { notification } from 'ant-design-vue'

export const useConnectionStore = defineStore('connection', () => {
  const connectList = ref<ConnectionItem[]>([])

  function connect(id: string) {
    const peerStore = usePeerStore()
    const peer = peerStore.peer
    if (!peer) return

    for(const item of connectList.value){
      if(item.id === id){
        return
      }
    }
    const conn = peer.connect(id)
    conn.on('open', function () {
      connectList.value.push({
        name: '未知名称',
        id,
        selected: false,
        conn: conn
      })
      notification.open({
        message: '连接成功',
        description:
          `与 ID 为 ${conn.peer} 的用户连接成功`,
        duration: 4
      })
    })
  }

  function setConnectName(id: string, name: string) {
    for(const item of connectList.value){
      if(item.id === id){
        item.name = name
        return
      }
    }
  }

  function sendMessage(message: string) {
    const peerStore = usePeerStore()
    const peer = peerStore.peer
    if (!peer) return

    const messageItem: MessageItem = {
      name: peerStore.name,
      peerID: peerStore.peerID,
      content: message,
      time: new Date().toLocaleString()
    }
    useDialogStore().addDialogItem(true, messageItem)
    let toAll = true
    for(const conn of connectList.value){
      if(conn.selected){
        toAll = false
        break
      }
    }
    for(const conn of connectList.value){
      if(toAll || conn.selected){
        conn.conn.send(messageItem)
        conn.selected = false
      }
    }
  }

  return {
    connectList,
    connect,
    setConnectName,
    sendMessage
  }
})
