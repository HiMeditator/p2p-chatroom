import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useSettingStore = defineStore('setting', () => {
  const uiLanguage = ref('zh')

  return {
    uiLanguage
  }
})
