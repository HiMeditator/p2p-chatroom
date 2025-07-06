import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { i18n } from '../i18n'

export type UILanguage = 'zh' | 'en' | 'ja'

export const useSettingStore = defineStore('setting', () => {
  const uiLanguage = ref<UILanguage>('zh')

  watch(uiLanguage, (newValue) => {
    i18n.global.locale.value = newValue
  })

  return {
    uiLanguage
  }
})
