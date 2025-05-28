<template>
  <div class="video-panel">
    <div class="video-container">
      <div class="video-box">
        <video ref="localVideo" autoplay muted playsinline></video>
        <div class="video-label">本地视频</div>
      </div>
      <div class="video-box">
        <video ref="remoteVideo" autoplay playsinline></video>
        <div class="video-label">远程视频</div>
      </div>
    </div>
    <div class="control-panel">
      <a-select
        v-model:value="selectedPeer"
        style="width: 200px"
        placeholder="选择要视频通话的用户"
      >
        <a-select-option v-for="conn in connectList" :key="conn.id" :value="conn.id">
          {{ conn.name || '未知用户' }} ({{ conn.id }})
        </a-select-option>
      </a-select>
      <a-button 
        type="primary" 
        :disabled="!selectedPeer || isCalling"
        @click="startCall"
      >
        开始视频通话
      </a-button>
      <a-button 
        type="primary" 
        danger
        :disabled="!isCalling"
        @click="endCall"
      >
        结束视频通话
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, h } from 'vue'
import { storeToRefs } from 'pinia'
import { usePeerStore } from '@/stores/peer'
import { useConnectionStore } from '@/stores/connection'
import { notification } from 'ant-design-vue'

const peerStore = usePeerStore()
const connectionStore = useConnectionStore()
const { connectList } = storeToRefs(connectionStore)

const localVideo = ref<HTMLVideoElement>()
const remoteVideo = ref<HTMLVideoElement>()
const selectedPeer = ref<string>()
const isCalling = ref(false)
let localStream: MediaStream | null = null
let peerCall: any = null

// 监听视频通话请求
onMounted(() => {
  window.addEventListener('peer-call', handlePeerCall)
})

onUnmounted(() => {
  window.removeEventListener('peer-call', handlePeerCall)
  endCall()
})

function handlePeerCall(event: Event) {
  const call = (event as CustomEvent).detail
  if (isCalling.value) {
    call.close()
    return
  }

  notification.info({
    message: '收到视频通话请求',
    description: '是否接受？',
    btn: h('div', { 
      style: 'display: flex; gap: 8px; margin-top: 8px;' 
    }, [
      h('a-button', {
        type: 'primary',
        onClick: () => acceptCall(call),
        style: 'flex: 1; cursor: pointer;'
      }, '接受'),
      h('a-button', {
        danger: true,
        onClick: () => call.close(),
        style: 'flex: 1; cursor: pointer;'
      }, '拒绝')
    ])
  })
}

async function startCall() {
  if (!selectedPeer.value || !localVideo.value || !remoteVideo.value) return

  // 检查是否是同一设备
  if (selectedPeer.value === peerStore.peerID) {
    notification.error({
      message: '无法发起视频通话',
      description: '不能与自己进行视频通话'
    })
    return
  }

  try {
    // 获取本地媒体流
    localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    })
    localVideo.value.srcObject = localStream

    // 发起视频通话
    if (!peerStore.peer) return
    peerCall = peerStore.peer.call(selectedPeer.value, localStream)
    
    peerCall.on('stream', (stream: MediaStream) => {
      if (remoteVideo.value) {
        remoteVideo.value.srcObject = stream
      }
    })

    peerCall.on('close', () => {
      endCall()
    })

    isCalling.value = true
    notification.success({
      message: '视频通话已开始',
      description: '正在等待对方接听...'
    })
  } catch (err) {
    console.error('获取媒体设备失败:', err)
    notification.error({
      message: '启动视频通话失败',
      description: '请确保已授予摄像头和麦克风权限'
    })
  }
}

function endCall() {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop())
    localStream = null
  }
  
  if (peerCall) {
    peerCall.close()
    peerCall = null
  }

  if (localVideo.value) {
    localVideo.value.srcObject = null
  }
  if (remoteVideo.value) {
    remoteVideo.value.srcObject = null
  }
  if(isCalling.value){
    isCalling.value = false
    notification.info({
      message: '视频通话已结束'
    })
  }

}

async function acceptCall(call: any) {
  if (!localVideo.value || !remoteVideo.value) return

  // 检查是否是同一设备
  if (call.peer === peerStore.peerID) {
    call.close()
    notification.error({
      message: '无法接受视频通话',
      description: '不能与自己进行视频通话'
    })
    return
  }

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    })
    localVideo.value.srcObject = localStream

    call.answer(localStream)
    call.on('stream', (stream: MediaStream) => {
      if (remoteVideo.value) {
        remoteVideo.value.srcObject = stream
      }
    })

    call.on('close', () => {
      endCall()
    })

    peerCall = call
    isCalling.value = true
    selectedPeer.value = call.peer
  } catch (err) {
    console.error('获取媒体设备失败:', err)
    notification.error({
      message: '接受视频通话失败',
      description: '请确保已授予摄像头和麦克风权限'
    })
  }
}
</script>

<style scoped>
.video-panel {
  padding: 5px 20px;
}

.video-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.video-box {
  flex: 1;
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-box video {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.video-label {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
  border-radius: 4px;
}

.control-panel {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>