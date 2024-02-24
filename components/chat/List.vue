<template>
  <q-drawer
    v-model="layoutStore.isChatListOpen"
    show-if-above
    bordered
    :breakpoint="690"
  >
    <q-toolbar class="bg-grey-3">
      <q-avatar v-if="avatar" class="cursor-pointer">
        <img :src="avatar" />
      </q-avatar>
      <q-skeleton v-else type="QAvatar" />

      <span v-if="name" class="q-subtitle-1 q-pl-md">
        {{ name }}
      </span>

      <q-space />

      <q-btn
        round
        flat
        icon="message"
        title="New Conversation"
        @click="openNewGroup()"
      />
      <q-btn round flat icon="more_vert">
        <q-menu auto-close :offset="[110, 8]">
          <q-list style="min-width: 150px">
            <q-item clickable @click="signOut()">
              <q-item-section>Logout</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-btn
        round
        flat
        icon="close"
        class="WAL__drawer-close"
        @click="layoutStore.toggleChatList"
      />
    </q-toolbar>

    <q-toolbar class="bg-grey-2">
      <q-input
        v-model="chatStore.search"
        rounded
        outlined
        dense
        class="WAL__field full-width"
        bg-color="white"
        placeholder="Search or start a new group"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </q-toolbar>

    <q-scroll-area style="height: calc(100% - 100px)">
      <q-list>
        <ChatGroup
          v-for="group in chatStore.orderedGroups"
          :id="group.id"
          :key="group.id"
          :ref="(el) => (groupRefs[group.id] = el)"
        />
      </q-list>
    </q-scroll-area>
  </q-drawer>
  <ChatNew v-model="isNewGroupOpen" />
</template>

<script setup>
import { getAvatarByName } from '@/utils'

const chatStore = useChatStore()
const layoutStore = useLayoutStore()
const { getAuthUser, getListGroups, listenGroups, logout } = useFirebase()

const avatar = ref('')
const name = ref('')
const groupRefs = ref({})
const isNewGroupOpen = ref(false)

let unsubscribe = null

const scrollToGroup = async (groupId) => {
  await nextTick()
  groupRefs.value[groupId]?.$el.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })
}

const signOut = async () => {
  await logout()
  navigateTo('/login')
}

const openNewGroup = () => {
  isNewGroupOpen.value = true
}

const getAuthAvatar = async () => {
  const authUser = await getAuthUser()
  name.value = authUser.data().name
  avatar.value = getAvatarByName(authUser.data().name)
}

const getListConversations = async () => {
  const docs = await getListGroups()

  if (docs.length) {
    chatStore.addGroups(docs)
  }
}

const listenConversations = async () => {
  unsubscribe = listenGroups((snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === 'added' || change.type === 'modified') {
        const group = chatStore.findGroup(change.doc.id)
        if (group) {
          chatStore.updateGroup(change.doc.id, {
            id: change.doc.id,
            ...change.doc.data(),
          })
        } else {
          chatStore.addGroup({
            id: change.doc.id,
            ...change.doc.data(),
          })
        }
      }

      scrollToGroup(change.doc.id)
    })
  })
}

watch(
  () => chatStore.currentGroupId,
  (groupId) => {
    scrollToGroup(groupId)
  },
  {
    immediate: true,
  },
)

onMounted(() => {
  getAuthAvatar()
  getListConversations()
  listenConversations()
})

onUnmounted(() => {
  if (unsubscribe && typeof unsubscribe === 'function') {
    unsubscribe()
  }
})
</script>
