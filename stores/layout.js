import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', {
  state: () => {
    return {
      isChatListOpen: false,
    }
  },
  actions: {
    toggleChatList() {
      this.isChatListOpen = !this.isChatListOpen
    },
  },
})
