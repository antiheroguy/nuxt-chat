<template>
  <q-item
    v-show="isFilter"
    v-ripple
    clickable
    :style="{
      background: props.id === chatStore?.currentGroupId ? '#ddd' : null,
      borderLeft: !isRead ? '2px solid #2196f3' : null,
    }"
    @click="setCurrentGroup()"
  >
    <q-item-section avatar>
      <q-avatar v-if="image">
        <img :src="image" />
      </q-avatar>

      <q-skeleton v-else type="QAvatar" />
    </q-item-section>

    <q-item-section>
      <q-item-label v-if="name" lines="1">
        {{ name }}
      </q-item-label>
      <q-skeleton v-else type="text" />
      <q-item-label v-if="lastMessage" class="conversation__summary" caption>
        {{ lastMessage }}
      </q-item-label>
    </q-item-section>

    <q-item-section v-if="updatedAt" side>
      <q-item-label caption>
        {{ updatedAt }}
      </q-item-label>
      <q-icon v-if="!isRead" name="circle" color="blue" size="xs" />
    </q-item-section>
  </q-item>
</template>

<script setup>
const props = defineProps({
  id: {
    type: String,
    default: '',
  },
})

const chatStore = useChatStore()
const { parseGroup, readMessage } = useFirebase()

const name = ref('')
const image = ref('')
const isRead = ref(false)
const lastMessage = ref(null)
const updatedAt = ref(null)

const isFilter = computed(() => {
  return !chatStore.search || name.value.includes(chatStore.search)
})

const setGroupData = async (group) => {
  const {
    name: groupName,
    image: groupImage,
    lastMessage: groupLastMessage,
    isRead: groupIsRead,
    updatedAt: groupUpdatedAt,
  } = await parseGroup(group)
  name.value = groupName
  image.value = groupImage
  lastMessage.value = groupLastMessage
  isRead.value = groupIsRead
  updatedAt.value = groupUpdatedAt
}

const setCurrentGroup = async () => {
  chatStore.setCurrentGroupId(props.id)
  const lastMessageId = chatStore.groups[props.id].last_message?.id
  if (lastMessageId) {
    await readMessage(lastMessageId, [])
    await nextTick()
    await setGroupData(chatStore.groups[props.id])
  }
}

watch(
  () => chatStore.groups[props.id].last_message?.id,
  () => {
    setGroupData(chatStore.groups[props.id])
  },
  {
    deep: true,
    immediate: true,
  },
)
</script>
