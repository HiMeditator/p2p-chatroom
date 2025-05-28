<template>
<div>
  <div>
    <a-row>
      <a-col :span="4">
        <a-statistic title="连接数量" :value="connectList.length" />
      </a-col>
      <a-col :span="16">
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
      <a-col :span="4">
        <div style="color: rgba(0,0,0,0.45);margin-bottom: 4px;">项目地址</div>
        <a href="https://github.com/HiMeditator/p2p-chatroom"
          target="_blank" class="proj-link"
        >
          <GithubOutlined  title="GitHub"/>
        </a>
      </a-col>
    </a-row>
  </div>
  <div class="input-item">
    <a-switch
      v-model:checked="useCustomPeerID"
      :disabled="nameReady"
      class="custom-peer-switch"
    />
    <span class="switch-label">使用自定义 Peer ID</span>
    <span class="switch-label-info">不要使用太简单的 ID，防止冲突</span>
    <a-input
      v-if="useCustomPeerID"
      v-model:value="customPeerID"
      placeholder="输入自定义 Peer ID"
      class="custom-peer-input"
      :disabled="nameReady"
    />
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
      <span v-if="!name.trim()">{{ "名称不能为空，确认后无法修改，如果确认后长时间没有Peer ID，请重新刷新页面" }}</span>
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
  <div style="height: 10px;"></div>
  <a-tabs v-model:activeKey="activeTab">
    <a-tab-pane key="active" tab="直接连接">
      <a-table 
        :scroll="{ x: 'max-content' }" 
        :dataSource="connectList" 
        :columns="connCol"
        :pagination="false"
        size="middle"
      >
        <template #bodyCell="{ column, text, record }">
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
          <template v-if="column.key === 'online'">
            <a-tag :color="record.online ? 'success' : 'error'">
              {{ record.online ? '在线' : '离线' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-button
              type="link"
              danger
              @click="handleDisconnect(record.id, record.name)"
              title="断开连接"
            >
              <template #icon><DisconnectOutlined /></template>
            </a-button>
          </template>
        </template>
      </a-table>
    </a-tab-pane>
    <a-tab-pane key="friend" tab="间接连接">
      <a-button
        type="primary"
        style="margin-bottom:10px;"
        @click="useConnectionStore().getFriendNodeList()"
      >获取最新间接连接</a-button>
      <a-table 
        :scroll="{ x: 'max-content' }" 
        :dataSource="friendNodeList" 
        :columns="nodeCol"
        :pagination="false"
        size="middle"
      >
        <template #bodyCell="{ column, text, record }">
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
          <template v-if="column.key === 'online'">
            <a-tag :color="record.online ? 'success' : 'error'">
              {{ record.online ? '在线' : '离线' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-button
              type="link"
              @click="useConnectionStore().connect(record.id)"
              title="连接"
            >
              <template #icon><LinkOutlined /></template>
            </a-button>
          </template>
        </template>
      </a-table>
    </a-tab-pane>
  </a-tabs>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePeerStore } from '@/stores/peer'
import { useConnectionStore } from '@/stores/connection'
import { CopyOutlined, DisconnectOutlined, LinkOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { GithubOutlined } from '@ant-design/icons-vue';
const { peerID, name }  = storeToRefs(usePeerStore())
const userPeerID = ref('')
const nameReady = ref(false)
const { connectList, friendNodeList  } = storeToRefs(useConnectionStore())
const copyStatus = ref('点击复制')
const useCustomPeerID = ref(false)
const customPeerID = ref('')
const activeTab = ref('active')

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
  },
  {
    title: '状态',
    dataIndex: 'online',
    key: 'online',
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    width: 100
  }
]

const nodeCol = [
  { 
    title: '用户名称', 
    dataIndex: 'name', 
    key: 'name'
  },
  { 
    title: 'Peer ID', 
    dataIndex: 'id', 
    key: 'id'
  },
  {
    title: '操作',
    key: 'action',
    width: 100
  }
]

function confirmName() {
  if(name.value.trim()){
    nameReady.value = true
    if (useCustomPeerID.value && customPeerID.value.trim()) {
      usePeerStore().initPeer(customPeerID.value)
    } else {
      usePeerStore().initPeer()
    }
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

function handleDisconnect(id: string, name: string) {
  Modal.confirm({
    title: '确认断开连接',
    content: `确定要断开与用户 ${name} 的连接吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      useConnectionStore().disconnect(id)
    }
  })
}
</script>

<style scoped>
.proj-link {
  display: inline-block;
  font-size: 24px;
  cursor: pointer;
  color: #1f2328;
  /* margin-top: 10px; */
}

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

.custom-peer-switch {
  margin-right: 8px;
}

.switch-label {
  margin-right: 16px;
}

.switch-label-info {
  font-size: 13px;
  font-weight: lighter;
  vertical-align: bottom;
}

.custom-peer-input {
  margin-top: 8px;
}
</style>