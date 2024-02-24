<template>
  <q-dialog v-model="model">
    <q-card>
      <q-form class="q-gutter-md" @submit="createNewGroup">
        <q-card-section>
          <div class="text-h6">New Conversation</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="q-gutter-y-md column">
            <q-select
              v-model="members"
              :options="options"
              :rules="memberRule"
              dense
              input-debounce="0"
              label="Members"
              multiple
              stack-label
              style="width: 250px"
              use-chips
              use-input
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-input
              v-if="members.length > 1"
              v-model="name"
              :rules="nameRule"
              dense
              label="Name"
              stack-label
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn color="primary" flat label="OK" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
const model = defineModel({ type: Boolean })

const chatStore = useChatStore()
const { addGroup, getListOtherUsers } = useFirebase()

const name = ref(null)
const members = ref([])
const options = ref([])

const nameRule = [(val) => members?.length < 1 || !!val || 'Name is required']
const memberRule = [(val) => val?.length >= 1 || 'Members is required']

const setListUsers = async () => {
  options.value = await getListOtherUsers()
}

const createNewGroup = async () => {
  model.value = false
  const groupId = await addGroup(members.value, name.value)
  await nextTick()
  chatStore.setCurrentGroupId(groupId)
}

onMounted(() => {
  setListUsers()
})
</script>
