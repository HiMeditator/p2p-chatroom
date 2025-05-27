<template>
  <div class="input-lower">
    <div></div>
    <div class="send-message" @click="sendMessage">
      <span>Ctrl+Enter</span>
      <FontAwesomeIcon :icon="faArrowRight" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

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
  margin-left: 5px;
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