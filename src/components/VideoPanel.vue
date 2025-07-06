<template>
  <div class="video-panel">
    <div class="video-container">
      <div class="video-box">
        <video ref="localVideo" autoplay muted playsinline></video>
        <div class="video-label">{{ $t('video.local') }}</div>
        <div class="video-controls">
          <a-button 
            type="text" 
            size="small"
            @click="toggleFullscreen(localVideo)"
            class="control-btn"
          >
            <template #icon>
              <FullscreenOutlined v-if="!isLocalFullscreen" />
              <FullscreenExitOutlined v-else />
            </template>
          </a-button>
          <a-button 
            type="text" 
            size="small"
            @click="toggleFloating('local')"
            class="control-btn"
          >
            <template #icon>
              <PictureOutlined />
            </template>
          </a-button>
        </div>
      </div>
      <div class="video-box">
        <video ref="remoteVideo" autoplay playsinline></video>
        <div class="video-label">{{ $t('video.remote') }}</div>
        <div class="video-controls">
          <a-button 
            type="text" 
            size="small"
            @click="toggleFullscreen(remoteVideo)"
            class="control-btn"
          >
            <template #icon>
              <FullscreenOutlined v-if="!isRemoteFullscreen" />
              <FullscreenExitOutlined v-else />
            </template>
          </a-button>
          <a-button 
            type="text" 
            size="small"
            @click="toggleFloating('remote')"
            class="control-btn"
          >
            <template #icon>
              <PictureOutlined />
            </template>
          </a-button>
        </div>
      </div>
    </div>
    <div class="control-panel">
      <a-select
        v-model:value="selectedPeer"
        style="width: 200px"
        :placeholder="$t('video.selectUser')"
      >
        <a-select-option v-for="conn in connectList" :key="conn.id" :value="conn.id">
          {{ conn.name || conn.id }} ({{ conn.id }})
        </a-select-option>
      </a-select>
      <a-button 
        type="primary" 
        :disabled="!selectedPeer || isCalling"
        @click="startCall"
      >
        {{ $t('video.start') }}
      </a-button>
      <a-button 
        type="primary" 
        danger
        :disabled="!isCalling"
        @click="endCall"
      >
        {{ $t('video.stop') }}
      </a-button>
    </div>

    <div 
      v-if="floatingVideo.show" 
      class="floating-video"
      :style="floatingVideo.style"
      @mousedown="startDrag"
      @touchstart="startDrag"
      @touchstart.passive="false"
    >
      <video 
        ref="floatingVideoElement"
        autoplay 
        :muted="floatingVideo.type === 'local'"
        playsinline
      ></video>
      <div class="floating-controls">
        <a-button 
          type="text" 
          size="small"
          @click="handleCloseClick"
          @touchstart.stop="handleCloseClick"
          class="control-btn close-btn"
        >
          <template #icon>
            <CloseOutlined />
          </template>
        </a-button>
      </div>

      <div class="resize-handle resize-handle-se" @mousedown="startResize" @touchstart="startResize"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, h, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { usePeerStore } from '@/stores/peer'
import { useConnectionStore } from '@/stores/connection'
import { notification } from 'ant-design-vue'
import { 
  FullscreenOutlined, 
  FullscreenExitOutlined, 
  PictureOutlined,
  CloseOutlined 
} from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const peerStore = usePeerStore()
const connectionStore = useConnectionStore()
const { connectList } = storeToRefs(connectionStore)

const localVideo = ref<HTMLVideoElement>()
const remoteVideo = ref<HTMLVideoElement>()
const floatingVideoElement = ref<HTMLVideoElement>()
const selectedPeer = ref<string>()
const isCalling = ref(false)
const isLocalFullscreen = ref(false)
const isRemoteFullscreen = ref(false)
const floatingVideo = ref({
  show: false,
  type: 'local' as 'local' | 'remote',
  style: {
    left: '20px',
    top: '20px',
    width: '200px',
    height: '150px'
  }
})

let localStream: MediaStream | null = null
let peerCall: any = null
let isDragging = false
let dragStartX = 0
let dragStartY = 0
let dragStartLeft = 0
let dragStartTop = 0
let isResizing = false
let resizeStartX = 0
let resizeStartY = 0
let resizeStartWidth = 0
let resizeStartHeight = 0

onMounted(() => {
  window.addEventListener('peer-call', handlePeerCall)
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', handleDrag)
  document.addEventListener('touchend', stopDrag)
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('touchmove', handleResize)
  document.addEventListener('touchend', stopResize)
})

onUnmounted(() => {
  window.removeEventListener('peer-call', handlePeerCall)
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', stopDrag)
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchmove', handleResize)
  document.removeEventListener('touchend', stopResize)
  endCall()
})

function toggleFullscreen(videoElement: HTMLVideoElement | undefined) {
  if (!videoElement) return

  if (videoElement === localVideo.value) {
    isLocalFullscreen.value = !isLocalFullscreen.value
  } else {
    isRemoteFullscreen.value = !isRemoteFullscreen.value
  }

  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    videoElement.requestFullscreen()
  }
}

function toggleFloating(type: 'local' | 'remote') {
  if (floatingVideo.value.show && floatingVideo.value.type === type) {
    closeFloating()
  } else {
    openFloating(type)
  }
}

function openFloating(type: 'local' | 'remote') {
  floatingVideo.value = {
    show: true,
    type,
    style: {
      left: '20px',
      top: '20px',
      width: '320px',
      height: '240px'
    }
  }
  
  nextTick(() => {
    if (floatingVideoElement.value) {
      if (type === 'local' && localVideo.value?.srcObject) {
        floatingVideoElement.value.srcObject = localVideo.value.srcObject
      } else if (type === 'remote' && remoteVideo.value?.srcObject) {
        floatingVideoElement.value.srcObject = remoteVideo.value.srcObject
      }
    }
  })
}

function closeFloating() {
  if (floatingVideoElement.value) {
    floatingVideoElement.value.srcObject = null
  }
  floatingVideo.value.show = false
}

// 防止事件冒泡到拖拽处理
function handleCloseClick(event: Event) {
  event.stopPropagation()
  closeFloating()
}

function startDrag(event: MouseEvent | TouchEvent) {
  if (!floatingVideo.value.show || isResizing) return
  
  // 检查是否点击在控制按钮上
  const target = event.target as HTMLElement
  if (target.closest('.floating-controls') || target.closest('.close-btn')) {
    return
  }
  
  isDragging = true
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  
  if (event instanceof MouseEvent) {
    dragStartX = event.clientX
    dragStartY = event.clientY
  } else {
    dragStartX = event.touches[0].clientX
    dragStartY = event.touches[0].clientY
  }
  
  dragStartLeft = rect.left
  dragStartTop = rect.top
  
  event.preventDefault()
}

function handleDrag(event: MouseEvent | TouchEvent) {
  if (!isDragging || !floatingVideo.value.show || isResizing) return
  
  let clientX: number, clientY: number
  
  if (event instanceof MouseEvent) {
    clientX = event.clientX
    clientY = event.clientY
  } else {
    clientX = event.touches[0].clientX
    clientY = event.touches[0].clientY
  }
  
  const deltaX = clientX - dragStartX
  const deltaY = clientY - dragStartY
  
  const currentWidth = parseInt(floatingVideo.value.style.width)
  const currentHeight = parseInt(floatingVideo.value.style.height)
  const newLeft = Math.max(0, Math.min(window.innerWidth - currentWidth, dragStartLeft + deltaX))
  const newTop = Math.max(0, Math.min(window.innerHeight - currentHeight, dragStartTop + deltaY))
  
  floatingVideo.value.style.left = `${newLeft}px`
  floatingVideo.value.style.top = `${newTop}px`
  
  event.preventDefault()
}

function stopDrag() {
  isDragging = false
}

function startResize(event: MouseEvent | TouchEvent) {
  if (!floatingVideo.value.show) return
  
  isResizing = true
  
  if (event instanceof MouseEvent) {
    resizeStartX = event.clientX
    resizeStartY = event.clientY
  } else {
    resizeStartX = event.touches[0].clientX
    resizeStartY = event.touches[0].clientY
  }
  
  const currentWidth = parseInt(floatingVideo.value.style.width)
  const currentHeight = parseInt(floatingVideo.value.style.height)
  resizeStartWidth = currentWidth
  resizeStartHeight = currentHeight
  
  event.preventDefault()
  event.stopPropagation()
}

function handleResize(event: MouseEvent | TouchEvent) {
  if (!isResizing || !floatingVideo.value.show || isDragging) return
  
  let clientX: number, clientY: number
  
  if (event instanceof MouseEvent) {
    clientX = event.clientX
    clientY = event.clientY
  } else {
    clientX = event.touches[0].clientX
    clientY = event.touches[0].clientY
  }
  
  const deltaX = clientX - resizeStartX
  const deltaY = clientY - resizeStartY
  
  const newLeft = parseInt(floatingVideo.value.style.left)
  const newTop = parseInt(floatingVideo.value.style.top)
  
  const newWidth = Math.max(150, Math.min(window.innerWidth - newLeft, resizeStartWidth + deltaX))
  const newHeight = Math.max(100, Math.min(window.innerHeight - newTop, resizeStartHeight + deltaY))
  
  floatingVideo.value.style.width = `${newWidth}px`
  floatingVideo.value.style.height = `${newHeight}px`
  
  event.preventDefault()
}

function stopResize() {
  isResizing = false
}

function handlePeerCall(event: Event) {
  const call = (event as CustomEvent).detail
  if (isCalling.value) {
    call.close()
    return
  }

  notification.info({
    message: t('noti.getVideoRequest'),
    description: t('noti.isAccept'),
    btn: h('div', { 
      style: 'display: flex; gap: 8px; margin-top: 8px;' 
    }, [
      h('a-button', {
        type: 'primary',
        onClick: () => {
          acceptCall(call)
          notification.close('video-call-request')
        },
        style: 'flex: 1; cursor: pointer;'
      }, t('noti.accept')),
      h('a-button', {
        danger: true,
        onClick: () => {
          call.close()
          notification.close('video-call-request')
        },
        style: 'flex: 1; cursor: pointer;'
      }, t('noti.reject'))
    ]),
    key: 'video-call-request'
  })
}

async function startCall() {
  if (!selectedPeer.value || !localVideo.value || !remoteVideo.value) return

  if (selectedPeer.value === peerStore.peerID) {
    notification.error({
      message: t('noti.callFail'),
      description: t('noti.selfError')
    })
    return
  }

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    })
    localVideo.value.srcObject = localStream
    
    if (floatingVideo.value.show && floatingVideo.value.type === 'local' && floatingVideoElement.value) {
      floatingVideoElement.value.srcObject = localStream
    }

    if (!peerStore.peer) return
    peerCall = peerStore.peer.call(selectedPeer.value, localStream)
    
    peerCall.on('stream', (stream: MediaStream) => {
      if (remoteVideo.value) {
        remoteVideo.value.srcObject = stream
      }
      if (floatingVideo.value.show && floatingVideo.value.type === 'remote' && floatingVideoElement.value) {
        floatingVideoElement.value.srcObject = stream
      }
    })

    peerCall.on('close', () => {
      endCall()
    })

    isCalling.value = true
    notification.success({
      message: t('noti.callStart'),
      description: t('noti.waitCall')
    })
  } catch (err) {
    notification.error({
      message: t('noti.callError'),
      description: t('noti.mediaIssue')
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
      message: t('noti.callEnd')
    })
  }

  closeFloating()
}

async function acceptCall(call: any) {
  if (!localVideo.value || !remoteVideo.value) return

  if (call.peer === peerStore.peerID) {
    call.close()
    notification.error({
      message: t('noti.acceptError'),
      description: t('noti.selfError')
    })
    return
  }

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    })
    localVideo.value.srcObject = localStream

    if (floatingVideo.value.show && floatingVideo.value.type === 'local' && floatingVideoElement.value) {
      floatingVideoElement.value.srcObject = localStream
    }

    call.answer(localStream)
    call.on('stream', (stream: MediaStream) => {
      if (remoteVideo.value) {
        remoteVideo.value.srcObject = stream
      }
      if (floatingVideo.value.show && floatingVideo.value.type === 'remote' && floatingVideoElement.value) {
        floatingVideoElement.value.srcObject = stream
      }
    })

    call.on('close', () => {
      endCall()
    })

    peerCall = call
    isCalling.value = true
    selectedPeer.value = call.peer
  } catch (err) {
    notification.error({
      message: t('noti.acceptError'),
      description: t('noti.mediaIssue')
    })
  }
}
</script>

<style scoped>
.video-panel {
  padding: 5px 20px;
  position: relative;
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
  z-index: 2;
}

.video-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 4px;
  z-index: 3;
}

.control-btn {
  background: rgba(0, 0, 0, 0.5) !important;
  border: none !important;
  color: white !important;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(0, 0, 0, 0.7) !important;
  color: white !important;
}

.control-panel {
  display: flex;
  gap: 10px;
  align-items: center;
}

.floating-video {
  position: fixed;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  cursor: move;
  user-select: none;
}

.floating-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.floating-controls {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 1001;
}

.floating-controls .control-btn {
  width: 24px;
  height: 24px;
  font-size: 12px;
}

.floating-controls .close-btn {
  min-width: 44px;
  min-height: 44px;
  padding: 10px;
  background: rgba(255, 0, 0, 0.2) !important;
  border-radius: 50% !important;
  transition: all 0.2s ease;
}

.floating-controls .close-btn:hover {
  background: rgba(255, 0, 0, 1) !important;
  transform: scale(1.1);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .floating-controls .close-btn {
    min-width: 48px;
    min-height: 48px;
    padding: 12px;
    touch-action: manipulation;
  }
  
  .floating-controls {
    top: 8px;
    right: 8px;
  }
  
  .floating-video {
    touch-action: pan-x pan-y;
  }
}

.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  cursor: pointer;
  z-index: 1002;
}

.resize-handle-se {
  bottom: 2px;
  right: 2px;
  cursor: se-resize;
}

.resize-handle:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.2);
}
</style>