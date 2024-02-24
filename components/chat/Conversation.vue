<template>
  <q-page-container ref="containerRef" class="bg-grey-2">
    <q-page padding class="flex column justify-end">
      <div class="q-pa-md row justify-center full-height">
        <div id="conversation" class="full-width full-height">
          <div
            v-if="chatStore.orderedMessages.length"
            v-intersection="onMessageInView"
            class="q-mb-xl"
          />
          <div v-if="loading" class="row justify-center q-my-md">
            <q-spinner color="primary" name="dots" size="40px" />
          </div>
          <q-chat-message
            v-for="message in chatStore.orderedMessages"
            :ref="(el) => (chatRefs[message.id] = el)"
            :key="message.id"
            v-intersection="intersectOptions(message)"
            :avatar="getAvatarByName(message.sender.name)"
            :bg-color="message.is_owner ? 'primary' : 'amber'"
            :name="message.sender.name"
            :sent="message.is_owner"
            :stamp="message.created_at"
            :text-color="message.is_owner ? 'white' : 'black'"
          >
            <div>
              {{ message.content }}
            </div>
          </q-chat-message>
        </div>
      </div>
    </q-page>
  </q-page-container>
</template>

<script setup>
import { LIMIT_CHAT_MESSAGES } from '~/constants'
import { getAvatarByName } from '@/utils'

const chatStore = useChatStore()
const { getListMessages, listenMessages, readMessage } = useFirebase()

const lastMessage = ref(null)
const containerRef = ref(null)
const noMessageLeft = ref(false)
const isFirstLoad = ref(true)
const chatRefs = ref({})
const loading = ref(false)

let unsubscribe = null

const intersectOptions = (message) => ({
  async handler(entry) {
    if (!entry.isIntersecting) {
      return
    }
    readMessage(message.id, message.readBy)
  },
  cfg: {
    threshold: 1.0,
  },
})

const scrollToBottom = async () => {
  await nextTick()
  containerRef.value.$el.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

const onMessageInView = ({ isIntersecting }) => {
  if (isIntersecting) {
    getListConversations()
  }
}

const getListConversations = async () => {
  await nextTick()
  if (noMessageLeft.value) {
    return
  }

  loading.value = true
  const docs = await getListMessages(lastMessage.value)
  if (docs.length < LIMIT_CHAT_MESSAGES) {
    noMessageLeft.value = true
  }

  const oldMessage = lastMessage.value

  if (docs.length) {
    chatStore.addMessages(docs)
    lastMessage.value = docs[docs.length - 1].doc
  }
  loading.value = false

  if (isFirstLoad.value) {
    isFirstLoad.value = false
    scrollToBottom()
  } else if (oldMessage) {
    nextTick().then(() => {
      chatRefs.value[oldMessage.id].$el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })
  }
}

const resetConversation = () => {
  if (unsubscribe && typeof unsubscribe === 'function') {
    unsubscribe()
  }
  chatStore.emptyMessages()
  lastMessage.value = null
  noMessageLeft.value = false
  isFirstLoad.value = true
}

const listenConversation = (groupId) => {
  unsubscribe = listenMessages(groupId, (messages) => {
    messages.forEach((message) => {
      chatStore.addMessage(message)
    })
    scrollToBottom()
  })
}

watch(
  () => chatStore.currentGroupId,
  async (groupId) => {
    resetConversation()
    getListConversations()
    listenConversation(groupId)
  },
  {
    immediate: true,
  },
)

onUnmounted(() => {
  if (unsubscribe && typeof unsubscribe === 'function') {
    unsubscribe()
  }
})
</script>
