<template>
  <div class="chat-container">
    <div class="setting">
      <a-radio-group v-model:value="uiLanguage">
        <a-radio-button value="zh">中文</a-radio-button>
        <a-radio-button value="en">English</a-radio-button>
        <a-radio-button value="ja">日本語</a-radio-button>
      </a-radio-group>
    </div>
    <DialogBox />
    <div class="sep-line"></div>
    <InputBox />
  </div>
</template>

<script setup lang="ts">
import DialogBox from '../components/DialogBox.vue'
import InputBox from '../components/InputBox.vue'
import { useSettingStore } from '@/stores/setting'
import { storeToRefs } from 'pinia'

const settingStore = useSettingStore()
const { uiLanguage } = storeToRefs(settingStore)
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  border-right: 1px solid rgba(128, 128, 128, 0.4);
}

.setting {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
}

.dialog-box {
  flex: 1;
  overflow: auto;
  scrollbar-width: thin;
}

.sep-line {
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}

.input-box {
  flex-shrink: 0;
}
</style>
