import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Peer } from 'peerjs'
import { useDialogStore } from './dialog'
import { useConnectionStore } from './connection'
import type { MessageItem } from '@/types'

export const usePeerStore = defineStore('peer', () => {
  const peer = ref<Peer | null>(null)
  const name = ref('')
  const peerID = ref('')

  function initPeer(customID?: string) {
    if (peer.value) return

    if (customID) {
      peer.value = new Peer(customID)
    } else {
      peer.value = new Peer()
    }
    
    peer.value.on('open', function (id) {
      peerID.value = id
    })

    peer.value.on('connection', function (conn) {
      conn.on('data', function (data) {
        const msgItem = data as MessageItem
        if(msgItem.command === 'SET_NAME') {
          useConnectionStore().setConnectName(msgItem.peerID, msgItem.name)
        }
        else if(msgItem.command === 'MESSAGE'){
          useDialogStore().addDialogItem(false, msgItem)
        }
        else if(msgItem.command === 'DISCONNECT'){
          useConnectionStore().disconnect(msgItem.peerID)
        }
        else if(msgItem.command === 'GET_FRIEND_NODE'){
          useConnectionStore().sendFriendNodeList(msgItem.peerID)
        }
        else if(msgItem.command === 'SEND_NODE_LIST'){
          // console.log(`收到好友列表：${JSON.stringify(msgItem.friendNodeList)}`)
          const friendNodeList = msgItem.friendNodeList ?? []
          for(const node of friendNodeList){
            if(node.id !== peerID.value){
              useConnectionStore().addFriendNode(node)
            }
          }
        }
      })
    })

    peer.value.on('call', function (call) {
      const event = new CustomEvent('peer-call', { detail: call })
      window.dispatchEvent(event)
    })
  }

  function connect(id: string) {
    if (!peer.value) return
    useConnectionStore().connect(id)
  }

  return {
    peer,
    peerID,
    name,
    initPeer,
    connect
  }
})
