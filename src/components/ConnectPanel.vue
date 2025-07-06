<template>
<div>
  <div>
    <a-row>
      <a-col :span="4">
        <a-statistic :title="$t('conn.connNum')" :value="connectList.length" />
      </a-col>
      <a-col :span="16">
        <a-statistic title="Peer ID" :value="peerID || $t('conn.createName')">
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
        <div style="color: rgba(0,0,0,0.45);margin-bottom: 4px;">{{ $t('conn.projectLink') }}</div>
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
    <span class="switch-label">{{ $t('conn.customPeerID') }}</span>
    <span class="switch-label-info">{{ $t('conn.customPeerIDInfo') }}</span>
    <a-input
      v-if="useCustomPeerID && !nameReady"
      v-model:value="customPeerID"
      :placeholder="$t('conn.customPeerIDInput')"
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
      {{nameReady ? $t('conn.yourName') : $t('conn.confirmName')}}
      </a-button>
      <a-input
        v-model:value="name" :placeholder="$t('conn.yourName')"
        :status="name.trim() ? '' : 'error'"
        class="input-input" :disabled="nameReady"
      />
    </div>
    <div class="input-name-text">
      <span v-if="!name.trim()" style="display:inline-block;width: 55%;">
        {{ $t('conn.nameEmpty') }}
      </span>
    </div>
    <div class="input-item">
      <a-button
        type="primary" :disabled="userPeerID ? !nameReady : true"
        class="input-btn" @click="addUser"
      >{{ $t('conn.addUser') }}</a-button>
      <a-input
        class="input-input"
        v-model:value="userPeerID" :placeholder="$t('conn.userID')"
      />      
    </div>
  </div>
  <div style="height: 10px;"></div>
  <a-tabs v-model:activeKey="activeTab">
    <a-tab-pane key="active" :tab="$t('conn.connected')">
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
                :title="$t('conn.copy')"
              >
                <template #icon><CopyOutlined /></template>
              </a-button>
            </div>
          </template>
          <template v-if="column.key === 'online'">
            <a-tag :color="record.online ? 'success' : 'error'">
              {{ record.online ? $t('conn.online') : $t('conn.offline') }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-button
              type="link"
              danger
              @click="handleDisconnect(record.id, record.name)"
              :title="$t('conn.disconnect')"
            ><template #icon><DisconnectOutlined /></template>
            </a-button>
          </template>
        </template>
      </a-table>
    </a-tab-pane>
    <a-tab-pane key="friend" :tab="$t('conn.more')">
      <a-button
        type="primary"
        style="margin-bottom:10px;"
        @click="useConnectionStore().getFriendNodeList()"
      >{{ $t('conn.getMore') }}</a-button>
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
                :title="$t('conn.copy')"
              ><template #icon><CopyOutlined /></template>
              </a-button>
            </div>
          </template>
          <template v-if="column.key === 'online'">
            <a-tag :color="record.online ? 'success' : 'error'">
              {{ record.online ? $t('conn.online') : $t('conn.offline') }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-button
              type="link"
              @click="useConnectionStore().connect(record.id)"
              :title="$t('conn.connect')"
            ><template #icon><LinkOutlined /></template>
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
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
    title: 'Name', 
    dataIndex: 'name', 
    key: 'name'
  },
  { 
    title: 'Peer ID', 
    dataIndex: 'id', 
    key: 'id'
  },
  {
    title: 'Status',
    dataIndex: 'online',
    key: 'online',
    width: 100
  },
  {
    title: 'Operation',
    key: 'action',
    width: 100
  }
]

const nodeCol = [
  { 
    title: 'Name', 
    dataIndex: 'name', 
    key: 'name'
  },
  { 
    title: 'Peer ID', 
    dataIndex: 'id', 
    key: 'id'
  },
  {
    title: 'Operation',
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
    copyStatus.value = t('conn.copied')
    message.success(t('conn.idCopied'))
    setTimeout(() => {
      copyStatus.value = t('conn.copy')
    }, 2000)
  } catch (err) {
    message.error(t('conn.copyFailed'))
  }
}

async function copyID(id: string) {
  try {
    await navigator.clipboard.writeText(id)
    message.success(t('conn.idCopied'))
  } catch (err) {
    message.error(t('conn.copyFailed'))
  }
}

function handleDisconnect(id: string, name: string) {
  Modal.confirm({
    title: t('conn.disconnectConfirm'),
    content: `${t('conn.disconnectUser')}${name}`,
    okText: t('conn.confirm'),
    cancelText: t('conn.cancel'),
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