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

  function initPeer() {
    if (peer.value) return

    peer.value = new Peer()
    
    peer.value.on('open', function (id) {
      peerID.value = id
    })

    peer.value.on('connection', function (conn) {
      conn.on('data', function (data) {
        const msgItem = data as MessageItem
        useDialogStore().addDialogItem(false, msgItem)
      })
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
