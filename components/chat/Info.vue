<template>
  <q-header elevated>
    <q-toolbar class="bg-grey-3 text-black">
      <q-btn
        round
        flat
        icon="keyboard_arrow_left"
        class="WAL__drawer-open q-mr-sm"
        @click="layoutStore.toggleChatList"
      />

      <q-btn v-if="image" round flat>
        <q-avatar>
          <img :src="image" />
        </q-avatar>
      </q-btn>

      <q-skeleton v-else type="QAvatar" />

      <span v-if="name" class="q-subtitle-1 q-pl-md">
        {{ name }}
      </span>

      <q-space />

      <q-btn round flat icon="more_vert">
        <q-menu auto-close :offset="[110, 0]">
          <q-list style="min-width: 150px">
            <q-item clickable @click="copyToClipboard(name)">
              <q-item-section>Copy Group Name</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { copyToClipboard } from 'quasar'

const layoutStore = useChatStore()
const chatStore = useChatStore()
const { parseGroup } = useFirebase()

const id = ref(null)
const name = ref('')
const image = ref('')

const setGroupData = async (group) => {
  const {
    id: groupId,
    name: groupName,
    image: groupImage,
  } = await parseGroup(group)
  id.value = groupId
  name.value = groupName
  image.value = groupImage
}

watch(
  () => chatStore.currentGroupId,
  (groupId) => {
    setGroupData(chatStore.findGroup(groupId))
  },
  {
    immediate: true,
  },
)
</script>
