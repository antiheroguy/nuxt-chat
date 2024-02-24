<template>
  <div class="WAL position-relative bg-grey-4" :style="style">
    <q-layout
      view="lHh Lpr lFf"
      class="WAL__layout shadow-3 bg-grey-2"
      container
    >
      <ChatInfo v-if="chatStore.currentGroupId" />

      <ChatList />

      <ChatConversation v-if="chatStore.currentGroupId" />

      <ChatInput v-if="chatStore.currentGroupId" />
    </q-layout>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth'] })

const $q = useQuasar()
const { getMessagingToken, receiveMessage } = useFirebase()
const chatStore = useChatStore()

const style = computed(() => ({
  height: $q.screen.height + 'px',
}))

onMounted(() => {
  initMessaging()
})

onUnmounted(() => {
  chatStore.resetStates()
})

const initMessaging = async () => {
  if (!('Notification' in window)) {
    return
  }

  if (Notification.permission === 'granted') {
    return getMessagingToken()
  }

  const permission = await Notification.requestPermission()
  if (permission === 'granted') {
    try {
      const messaging = await getMessagingToken()
      receiveMessage(messaging, (payload) => {
        new Notification('New message')
      })
    } catch (e) {
      console.error(e)
    }
  }
}
</script>
