<template>
  <div class="input-box">
    <InputUpper />
    <textarea
      rows="1" :placeholder="$t('chat.input')"
      ref="taInput" @keydown="handleKeydown"
    ></textarea>
    <InputLower
      :sendMessage = "sendMessage"
    />
  </div>
</template>

<script setup lang="ts">
import autosize from 'autosize'
import { ref, onMounted } from 'vue'
import { useDialogStore } from '@/stores/dialog'
import { useConnectionStore } from '@/stores/connection'
import { storeToRefs } from 'pinia'
import InputUpper from './input/InputUpper.vue'
import InputLower from './input/InputLower.vue'

const dialogStore = useDialogStore()
const { dialog } = storeToRefs(dialogStore)
const taInput = ref<HTMLTextAreaElement>()

function handleKeydown(e: KeyboardEvent) {
  if(e.ctrlKey && e.key === 'Enter'){
    sendMessage()
  }
}

function sendMessage() {
  if(taInput.value) {
    const content = taInput.value.value;
    if (content.trim()) {
      useConnectionStore().sendMessage(content)
      taInput.value.value = '';
      taInput.value.style.height = 'auto';
    }
  }
}

onMounted(() => {
  if (taInput.value) {
    autosize(taInput.value);
  }
})
</script>

<style scoped>
.input-box {
  margin: 10px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  background-color: var(--vscode-input-background, #ffffff);
}

.input-box:focus-within {
  border: 1px solid var(--vscode-button-hoverBackground, #005fb8);
}

textarea {
  width: 100%;
  max-height: 40vh;
  font-size: 13px;
  line-height: 1.5em;
  overflow-x: auto !important;
  scrollbar-width: thin;
  padding: 5px;
  box-sizing: border-box;
  color: var(--vscode-input-foreground, #616161);
  background-color: var(--vscode-input-background, #ffffff);
  resize: none;
  border: none;
}

textarea:focus {
  outline: none;
}
</style>