<template>
  <q-footer>
    <q-toolbar class="bg-grey-4 text-black row">
      <q-btn
        class="q-mr-sm"
        flat
        icon="insert_emoticon"
        round
        title="This feature is coming soon"
      />
      <q-input
        v-model="chatStore.message"
        bg-color="white"
        class="WAL__field col-grow q-mr-sm"
        dense
        outlined
        placeholder="Type a message"
        rounded
        @keyup.enter="postMessage"
      />
      <q-btn round flat icon="mic" title="This feature is coming soon" />
    </q-toolbar>
  </q-footer>
</template>

<script setup>
const chatStore = useChatStore()
const { sendMessage } = useFirebase()

const {
  public: { apiUrl },
} = useRuntimeConfig()

const sendNotification = async (id) => {
  await $fetch('/send-notification', {
    baseURL: apiUrl,
    query: { id },
  })
}

const postMessage = async () => {
  if (!chatStore.message) {
    return
  }

  const messageId = await sendMessage(chatStore.message)
  sendNotification(messageId)
  chatStore.message = ''
}
</script>
