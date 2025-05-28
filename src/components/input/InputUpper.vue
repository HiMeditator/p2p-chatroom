<template>
  <div class="input-upper" @click.stop>
    <div class="dropup-box">
      <div class="dropup-option" v-if="displayContext">
        <ul class="dropup-list">
          <span v-for="(conn, index) in connectList" :key="conn.id">
            <li
              v-show="!conn.selected && conn.name.includes(search)"
              @click="conn.selected = !conn.selected"
              :class="{ selected: conn.selected }"
            >
              <span>{{ conn.name || 'unnamed' }}</span>
              <span class="small-text">{{ conn.id }}</span>
            </li>
          </span>
          <li v-show="!connectList.length">
            <span class="small-text">暂无连接用户</span>
          </li>
        </ul>
        <div class="dropup-input">
          <input
            type="text"
            class="dropup-input-content"
            v-model="search"
            placeholder="搜索用户名称"
          >
        </div>
      </div>

      <div class="add-user" @click="getContext">
        <FontAwesomeIcon :icon="faPlus" />
        <span>发送给特定用户</span>
      </div>
    </div>
    <div v-for="(conn, index) in connectList" :key="conn.id">
      <div class="add-user" v-show="conn.selected">
        <span @click="conn.selected = !conn.selected">{{ conn.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useConnectionStore } from '../../stores/connection'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

const displayContext = ref(false)
const search = ref('')

const connectionStore = useConnectionStore()
const { connectList } = storeToRefs(connectionStore)

function getContext() {
  displayContext.value = !displayContext.value
}

document.addEventListener('click', (e) => {
  if (displayContext.value) {
    displayContext.value = false
  }
})
</script>

<style scoped>
@import '../../assets/dropup.css';

.small-text {
  font-size: 12px;
}

.input-upper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.dropup-input {
  padding: 6px 12px;
  border-radius: 5px;
  border: 1px solid rgba(128, 128, 128, 0.4);
}

.dropup-input:focus-within {
  border: 1px solid var(--vscode-button-hoverBackground, #5a4579);
}

.dropup-input-content {
  border: none;
  width: 100%;
  color: var(--vscode-input-foreground, #616161);
  background-color: var(--vscode-input-background, #ffffff);
}

.dropup-input-content:focus {
  outline: none;
}

.add-user svg {
  margin-left: 2px;
  margin-right: 3px;
}

.add-user {
  user-select: none;
  border-radius: 5px;
  padding: 2px 4px;
  margin: 5px;
  box-sizing: border-box;
  color: var(--vscode-foreground, #616161);
  background-color: rgba(128, 128, 128, 0.1);
}

.add-user:hover {
  cursor: pointer;
  background-color: rgba(128, 128, 128, 0.2);
}
</style>