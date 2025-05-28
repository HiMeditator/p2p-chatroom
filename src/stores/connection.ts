import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useDialogStore } from './dialog'
import { usePeerStore } from './peer'
import type { ConnectionItem, MessageItem, NodeItem } from '@/types'
import { notification } from 'ant-design-vue'

export const useConnectionStore = defineStore('connection', () => {
  const connectList = ref<ConnectionItem[]>([])
  const friendNodeList = ref<NodeItem[]>([])
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
        conn,
        online: true
      })
      removeFriendNode(conn.peer)
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
      // 监听连接关闭
      conn.on('close', () => {
        updateConnectionStatus(id, false)
        notification.open({
          message: '连接断开',
          description: `与用户 ${name || id} 的连接已断开`,
          duration: 4
        })
      })
      // 监听连接错误
      conn.on('error', () => {
        updateConnectionStatus(id, false)
        notification.open({
          message: '连接错误',
          description: `与用户 ${name || id} 的连接出现错误`,
          duration: 4
        })
      })
    })
  }

  function updateConnectionStatus(id: string, online: boolean) {
    for(const item of connectList.value){
      if(item.id === id){
        item.online = online
        return
      }
    }
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
      if((toAll || conn.selected) && conn.online){
        conn.conn.send(messageItem)
      }
    }
  }

  function getFriendNodeList() {
    const peerStore = usePeerStore()
    const peer = peerStore.peer
    if (!peer) return
    const messageItem: MessageItem = {
      name: peerStore.name,
      peerID: peerStore.peerID,
      content: '',
      time: new Date().toLocaleString(),
      command: 'GET_FRIEND_NODE'
    }
    for(const conn of connectList.value){
      if(conn.online){
        conn.conn.send(messageItem)
        console.log(`请求获取 ${conn.name}: ${conn.id} 的好友列表`)
      }
    }
  }

  function sendFriendNodeList(targetID: string) {
    const peerStore = usePeerStore()
    const peer = peerStore.peer
    if (!peer) return
    const messageItem: MessageItem = {
      name: peerStore.name,
      peerID: peerStore.peerID,
      content: '',
      time: new Date().toLocaleString(),
      command: 'SEND_NODE_LIST',
      friendNodeList: []
    }
    for(const conn of connectList.value){
      if(conn.online){
        messageItem.friendNodeList?.push({
          name: conn.name,
          id: conn.id
        })
      }
    }
    for(const conn of connectList.value){
      if(conn.id === targetID && conn.online){
        conn.conn.send(messageItem)
        console.log(`发送好友列表给 ${conn.name}: ${conn.id}`)
        console.log(`发送列表信息: ${JSON.stringify(messageItem.friendNodeList)}`)
      }
    }
  }

  function addFriendNode(node: NodeItem) {
    for(const item of friendNodeList.value){
      if(item.id === node.id){
        return
      }
    }
    for(const item of connectList.value) {
      if(item.id === node.id){
        return
      }
    }
    console.log(`添加到好友列表: ${JSON.stringify(node)}`)
    friendNodeList.value.push(node)
  }

  function removeFriendNode(id: string) {
    for(let i = 0; i < friendNodeList.value.length; i++) {
      const item = friendNodeList.value[i]
      if(item.id === id) {
        friendNodeList.value.splice(i, 1)
        return
      }
    }
  }

  function disconnect(id: string) {
    const messageItem: MessageItem = {
      name: usePeerStore().name,
      peerID: usePeerStore().peerID,
      content: '',
      time: new Date().toLocaleString(),
      command: 'DISCONNECT'
    }
    for(let i = 0; i < connectList.value.length; i++) {
      const item = connectList.value[i]
      if(item.id === id) {
        item.conn.send(messageItem)
        item.conn.close()
        connectList.value.splice(i, 1)
        return
      }
    }
  }

  return {
    connectList,
    friendNodeList,
    connect,
    setConnectName,
    sendMessage,
    getFriendNodeList,
    sendFriendNodeList,
    addFriendNode,
    disconnect
  }
})
