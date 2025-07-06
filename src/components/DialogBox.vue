<template>
  <div class="dialog-box">
    <div v-for="(log,_) in dialog" :key="log.contentID" class="dialog-item">
      <UserDialog :dialog="log" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDialogStore } from '@/stores/dialog'
import { storeToRefs } from 'pinia'
import UserDialog from './dialog/UserDialog.vue'

const dialogStore = useDialogStore()
const { dialog } = storeToRefs(dialogStore)
</script>

<style scoped>
.dailog-box {
  overflow-y: auto;
  scrollbar-width: thin;
}
</style>