<template>
  <div class="input-upper" @click.stop>
    <div class="dropup-box">
      <div class="dropup-option" v-if="displayContext">
        <ul class="dropup-list">
          <span v-for="(conn, index) in connectionList" :key="conn.id">
            <li
              v-show="!conn.selected"
              @click="conn.selected = !conn.selected"
              :class="{ selected: conn.selected }"
            >
              <span>{{ conn.name || 'unnamed' }}</span>
              <sub>{{ conn.id }}</sub>
            </li>
          </span>
          <li v-show="!connectionList.length">
            <sub>暂无连接用户...</sub>
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

      <div class="add-context" @click="getContext">
        <FontAwesomeIcon :icon="faPlus" />
        <span>选择发送用户</span>
      </div>
    </div>
    <div v-for="(conn, path) in connectionList" :key="conn.id">
      <div class="selected-context" v-show="conn.selected">
        <span @click="conn.selected = !conn.selected">{{ conn.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPause, faPlus } from '@fortawesome/free-solid-svg-icons'

const displayContext = ref(false)
const search = ref('')

const connectionList = ref<any>()
connectionList.value = [
  {name: 'Jack', id: '0001', selected: false},
  {name: 'Tom', id: '0002', selected: false},
  {name: 'Jerry', id: '0003', selected: false},
]

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
@import '../../assets/css/dropup2.css';

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

.add-context,
.stop-generation {
  user-select: none;
  display: inline-block;
  padding: 2px 4px;
  margin: 5px;
  border-radius: 5px;
  background-color: rgba(128, 128, 128, 0.1);
}

.stop-generation svg,
.add-context svg {
  margin-left: 2px;
  margin-right: 3px;
}

.stop-generation:hover,
.add-context:hover {
  background-color: rgba(128, 128, 128, 0.2);
}


/* .dropup-option {
  box-shadow: 0 0 4px 2px rgba(128, 128, 128, 0.4);
} */

.selected-context {
  user-select: none;
  border-radius: 5px;
  padding: 2px 4px;
  margin: 5px;
  box-sizing: border-box;
  color: var(--vscode-foreground, #616161);
  background-color: rgba(128, 128, 128, 0.1);
}

.selected-context:hover {
  cursor: pointer;
  background-color: rgba(128, 128, 128, 0.2);
}
</style>