import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Peer } from 'peerjs'
import { useDialogStore } from './dialog'
import { useConnectionStore } from './connection'
import { nanoid } from 'nanoid'
import type { DialogItem, MessageItem } from '@/types'

export const usePeerStore = defineStore('peer', () => {
  const peer = new Peer();
  const name = ref('');
  const peerID = ref('');

  peer.on('open', function(id) {
    peerID.value = id;
  });

  peer.on('connection', function(conn) {
    conn.on('data', function(data) {
      useDialogStore().addDialogItem(false, data as MessageItem);
    });
  });

  function connect(id: string) {
    const conn = peer.connect(id);
    conn.on('open', function() {
      // conn.send({});
      console.log('连接成功');
      useConnectionStore().addConnect(conn);
    });
  }

  return {
    peerID,
    name,
    connect
  }
})
