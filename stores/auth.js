import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => {
    return {
      user: null,
    }
  },
  actions: {
    setUser(user) {
      this.user = user
    },
  },
})
