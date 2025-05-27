<template>
  <div class="input-lower">
    <div class="div-btn" @click="useDialogStore().clearDialog">
      <FontAwesomeIcon :icon="faXmark" />
      <span>清空聊天</span>
    </div>
    <div class="send-message" @click="sendMessage">
      <span>Ctrl+Enter</span>
      <FontAwesomeIcon :icon="faArrowRight" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowRight, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useDialogStore } from '@/stores/dialog'
defineProps<{
  sendMessage: () => void
}>()
</script>

<style scoped>
.input-lower {
  display: flex;
  margin: auto 5px;
  color: var(--vscode-disabledForeground, rgba(97, 97, 97, 0.5));
  align-items: center;
  justify-content: space-between;
  /* border: 1px solid black; */
}

svg {
  margin: 0 5px;
}

.div-btn {
  color: var(--vscode-foreground, #616161);
  user-select: none;
  display: inline-block;
  padding: 0 4px;
  border-radius: 5px;
  background-color: rgba(128, 128, 128, 0.1);
}

.div-btn:hover {
  cursor: pointer;
  background-color: rgba(128, 128, 128, 0.2);
}

.send-message {
  user-select: none;
  cursor: pointer;
  max-width: 30vw;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.send-message:hover {
  color: var(--vscode-foreground, #616161);
}
</style>