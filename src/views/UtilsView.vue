<template>
<div class="utils-view">
  <div>
    <a-row>
      <a-col :span="4">
        <a-statistic title="连接数量" :value="connectList.length" />
      </a-col>
      <a-col :span="20">
        <a-statistic title="Peer ID" :value="peerID" />
      </a-col>
    </a-row>
  </div>
  <div class="input-info">
    <div class="input-item">
      <a-input
        v-model:value="name" placeholder="你的名称"
        :status="name.trim() ? '' : 'error'"
      />
    </div>
    <div class="input-name-text">
      <span v-if="!name.trim()">{{ "名称不能为空" }}</span>
    </div>
    <div class="input-item">
      <a-button
        type="primary" :disabled="userPeerID ? !name.trim() : true"
        class="add-user" @click="addUser"
      >添加用户</a-button>
      <a-input
        class="input-id"
        v-model:value="userPeerID" placeholder="用户 Peer ID"
      />      
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePeerStore } from '@/stores/peer'
import { useConnectionStore } from '@/stores/connection'

const { peerID, name }  = storeToRefs(usePeerStore())
const userPeerID = ref('')
const { connectList } = storeToRefs(useConnectionStore())

function addUser() {
  if (userPeerID.value) {
    usePeerStore().connect(userPeerID.value)
    userPeerID.value = ''
  }
}
</script>

<style scoped>
.utils-view {
  padding: 20px;
}

.input-info {
  margin-top: 20px;
}

.input-item {
  width: 60%;
  margin-top: 10px;
}

.input-name-text {
  color: red;
  font-size: 13px;
  font-weight: lighter;
  vertical-align: bottom;
}

.add-user {
  width: 90px;
}

.input-id {
  margin-left: 10px;
  width: calc(100% - 100px);
}
</style>

