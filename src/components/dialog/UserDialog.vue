<template>
  <div :class="[dialog.me ? 'user-dialog-me' : 'user-dialog']">
    <div class="user-info">
      <div class="user-head">
        <FontAwesomeIcon :icon="faUser" />
      </div>
      <div class="user-name">{{ dialog.name }}</div>
      <a-popover class="dialog-info">
        <template #content>
          <div class="extra-info" v-if="!dialog.me">
            <b>Peer ID</b>&nbsp;
            <a-tag>{{ dialog.peerID }}</a-tag>
          </div>
          <div class="extra-info">
            <b>Time</b>&nbsp;
            <a-tag>{{ dialog.time }}</a-tag>
          </div>
        </template>
        <FontAwesomeIcon :icon="faInfo" />
      </a-popover>
    </div>
    <div class="user-content">
      <div class="dialog-content">{{ dialog.content.trim() }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import type { DialogItem } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUser, faInfo } from '@fortawesome/free-solid-svg-icons'
defineProps<{ dialog: DialogItem }>();
</script>

<style scoped>
.user-dialog {
  margin: 10px;
  padding: 10px;
  color: var(--vscode-foreground, #616161);
  background-color: rgba(128, 128, 128, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(128, 128, 128, 0.1);
  width: 75%;
}

.user-dialog-me {
  margin: 10px;
  padding: 10px;
  color: var(--vscode-foreground, #616161);
  background-color: rgba(0, 128, 0, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(0, 128, 0, 0.1);
  width: 75%;
  margin-left: calc(25% - 10px);
}

.user-dialog:hover {
  background-color: rgba(128, 128, 128, 0.1);
}

.user-dialog-me:hover {
  background-color: rgba(0, 128, 0, 0.1);
}

.user-info {
  position: relative;
  display: flex;
  align-items: center;
}

.user-head {
  width: 24px;
  height: 24px;
  color: white;
  border-radius: 50%;
  margin: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: cornflowerblue;
}

.user-dialog-me .user-head {
  background-color: blueviolet;
}

.user-name {
  display: inline-block;
}

.user-content {
  line-height: 1.6em;
  margin: 5px;
  overflow-x: auto;
  scrollbar-width: thin;
}

.dialog-info {
  position: absolute;
  padding: 5px 10px;
  border-radius: 5px;
  right: 0;
  top: 0;
}

.dialog-content {
  white-space: pre-wrap;
}

.sep-div{
  margin: 10px 0 5px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.4);
}

.extra-info {
  font-size: 12px;
  line-height: 2.2em;
}
</style>