import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => {
    return {
      message: '',
      search: null,
      groups: {},
      messages: [],
      currentGroupId: null,
      unsubscribes: [],
    }
  },
  getters: {
    currentGroup: (state) => state.groups[state.currentGroupId] || null,
    orderedGroups: (state) =>
      Object.values(state.groups).toSorted(
        (a, b) => b.updated_at - a.updated_at,
      ),
    orderedMessages: (state) =>
      state.messages
        .filter(
          (message, index) =>
            state.messages.findIndex((item) => item.id === message.id) ===
            index,
        )
        .slice()
        .reverse(),
  },
  actions: {
    resetStates() {
      this.message = ''
      this.search = null
      this.currentGroupId = null
      this.groups = {}
      this.unsubscribes.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe()
        }
      })
      this.unsubscribes = []
    },
    setCurrentGroupId(groupId) {
      this.currentGroupId = groupId
    },
    addGroup(group) {
      this.groups[group.id] = group
    },
    addGroups(groups) {
      groups.forEach((group) => {
        this.groups[group.id] = group
      })
    },
    findGroup(groupId) {
      return this.groups[groupId]
    },
    updateGroup(groupId, group) {
      this.groups[groupId] = group
    },
    emptyMessages() {
      this.messages = []
    },
    addMessage(message) {
      this.messages = [message, ...this.messages]
    },
    addMessages(messages) {
      this.messages = [...this.messages, ...messages]
    },
    addUnsubscribes(unsubscribe) {
      this.unsubscribes.push(unsubscribe)
    },
  },
})
