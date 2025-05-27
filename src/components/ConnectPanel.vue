<template>
<div>
  <div>
    <a-row>
      <a-col :span="4">
        <a-statistic title="连接数量" :value="connectList.length" />
      </a-col>
      <a-col :span="20">
        <a-statistic title="Peer ID" :value="peerID || '请先创建名称'">
          <template #suffix>
            <a-button 
              v-if="peerID"
              type="link" 
              @click="copyPeerID"
              :title="copyStatus"
            >
              <template #icon><CopyOutlined /></template>
            </a-button>
          </template>
        </a-statistic>
      </a-col>
    </a-row>
  </div>
  <div class="input-info">
    <div class="input-item">
      <a-button
        type="primary" :disabled="nameReady"
        class="input-btn" @click="confirmName"
      >
      {{nameReady ? '你的名称' : '确认名称'}}
      </a-button>
      <a-input
        v-model:value="name" placeholder="你的名称"
        :status="name.trim() ? '' : 'error'"
        class="input-input" :disabled="nameReady"
      />
    </div>
    <div class="input-name-text">
      <span v-if="!name.trim()">{{ "名称不能为空，确认后无法修改" }}</span>
    </div>
    <div class="input-item">
      <a-button
        type="primary" :disabled="userPeerID ? !nameReady : true"
        class="input-btn" @click="addUser"
      >添加用户</a-button>
      <a-input
        class="input-input"
        v-model:value="userPeerID" placeholder="用户 Peer ID"
      />      
    </div>
  </div>
  <div style="height: 20px;"></div>
  <a-table 
    :scroll="{ x: 'max-content' }" 
    :dataSource="connectList" 
    :columns="connCol"
    :pagination="false"
  >
    <template #bodyCell="{ column, text }">
      <template v-if="column.key === 'id'">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>{{ text }}</span>
          <a-button 
            type="link" 
            @click="copyID(text)"
            title="点击复制"
          >
            <template #icon><CopyOutlined /></template>
          </a-button>
        </div>
      </template>
    </template>
  </a-table>
</div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { storeToRefs } from 'pinia'
import { usePeerStore } from '@/stores/peer'
import { useConnectionStore } from '@/stores/connection'
import { CopyOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const { peerID, name }  = storeToRefs(usePeerStore())
const userPeerID = ref('')
const nameReady = ref(false)
const { connectList } = storeToRefs(useConnectionStore())
const copyStatus = ref('点击复制')

const connCol = [
  { 
    title: '用户名称', 
    dataIndex: 'name', 
    key: 'name'
  },
  { 
    title: 'Peer ID', 
    dataIndex: 'id', 
    key: 'id'
  }
]

function confirmName() {
  if(name.value.trim()){
    nameReady.value = true
    usePeerStore().initPeer()
  }
}

function addUser() {
  if (userPeerID.value) {
    usePeerStore().connect(userPeerID.value)
    userPeerID.value = ''
  }
}

async function copyPeerID() {
  if (!peerID.value) return
  try {
    await navigator.clipboard.writeText(peerID.value)
    copyStatus.value = '已复制'
    message.success('Peer ID 已复制到剪贴板')
    setTimeout(() => {
      copyStatus.value = '点击复制'
    }, 2000)
  } catch (err) {
    message.error('复制失败')
  }
}

async function copyID(id: string) {
  try {
    await navigator.clipboard.writeText(id)
    message.success('ID 已复制到剪贴板')
  } catch (err) {
    message.error('复制失败')
  }
}
</script>

<style scoped>
.input-info {
  margin-top: 20px;
}

.input-item {
  width: 60%;
  margin-top: 20px;
}

.input-name-text {
  color: red;
  font-size: 13px;
  font-weight: lighter;
  vertical-align: bottom;
  margin-left: 100px;
}

.input-btn {
  width: 90px;
}

.input-input {
  margin-left: 10px;
  width: calc(100% - 100px);
}
</style>