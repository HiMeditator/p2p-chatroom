import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Peer } from 'peerjs'
import { useDialogStore } from './dialog'
import { useConnectionStore } from './connection'
import type { MessageItem } from '@/types'

export const usePeerStore = defineStore('peer', () => {
  const peer = new Peer();
  const name = ref('');
  const peerID = ref('');

  peer.on('open', function (id) {
    peerID.value = id;
  });

  peer.on('connection', function (conn) {
    conn.on('data', function (data) {
      const msgItem = data as MessageItem; 
      useDialogStore().addDialogItem(false, msgItem);
    });
  });

  function connect(id: string) {
    useConnectionStore().connect(id);
  }

  return {
    peer,
    peerID,
    name,
    connect
  }
})
