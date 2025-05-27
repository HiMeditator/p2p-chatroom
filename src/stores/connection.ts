import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useDialogStore } from './dialog'
import { usePeerStore } from './peer'
import type { ConnectionItem, MessageItem } from '@/types'
import { notification } from 'ant-design-vue'

export const useConnectionStore = defineStore('connection', () => {
  const connectList = ref<ConnectionItem[]>([])

  function connect(id: string, name?: string) {
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
        name: name ||'未知名称',
        id,
        selected: false,
        conn
      })
      notification.open({
        message: '连接成功',
        description:
          `与 ID 为 ${conn.peer} 的用户连接成功`,
        duration: 4
      })
      console.log(`${ name? '反向' : '主动' }连接成功，发送用户名称信息: ${peerStore.name} -> ${conn.peer}`)
      const messageItem: MessageItem = {
        name: peerStore.name,
        peerID: peerStore.peerID,
        content: '',
        time: new Date().toLocaleString(),
        command: 'SET_NAME'
      }
      conn.send(messageItem)
    })
  }

  function setConnectName(id: string, name: string) {
    for(const item of connectList.value){
      if(item.id === id){
        console.log(`主动连接获取到反向连接名称: ${id} -> ${name}`)
        item.name = name
        return
      }
    }
    console.log(`收到主动连接，进行反向连接并设置名称: ${id} -> ${name}`)
    connect(id, name)
  }

  function sendMessage(message: string) {
    const peerStore = usePeerStore()
    const peer = peerStore.peer
    if (!peer) return

    const messageItem: MessageItem = {
      name: peerStore.name,
      peerID: peerStore.peerID,
      content: message,
      time: new Date().toLocaleString(),
      command: 'MESSAGE'
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
