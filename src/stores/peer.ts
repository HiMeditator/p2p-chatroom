import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Peer, DataConnection } from 'peerjs'
import { useChatStore } from './chat'
import { nanoid } from 'nanoid'
import type { ChatData } from '@/types'

export const usePeerStore = defineStore('peer', () => {
  const peer = new Peer();
  const peerID = ref('');
  const connectList = ref<DataConnection[]>([]);

  peer.on('open', function(id) {
    peerID.value = id;
  });

  peer.on('connection', function(conn) {
    conn.on('data', function(data) {
      const chatData = data as ChatData;
      useChatStore().addChatLog({
        me: false,
        name: chatData.name,
        peerID: conn.peer,
        contentID: nanoid(),
        content: chatData.content,
      });
    });
  });

  function connect(id: string) {
    const conn = peer.connect(id);
    conn.on('open', function() {
      console.log('连接成功');
      connectList.value.push(conn);
    });
  }

  function sendContent(id: string, content: string, name?: string){
    for(const conn of connectList.value){
      if(conn.peer === id){
        conn.send({name, content});
      }
    }
  }

  return {
    peerID,
    connectList,
    connect,
    sendContent
  }
})
