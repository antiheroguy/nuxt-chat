<template>
  <q-card class="q-pa-md shadow-2 auth-card" bordered>
    <q-form class="q-gutter-md" @submit="signUp">
      <q-card-section class="text-center">
        <div class="text-grey-9 text-h5 text-weight-bold">Sign up</div>
        <div class="text-grey-8">Create new account</div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="name"
          :rules="nameRule"
          dense
          label="Name"
          lazy-rules
          outlined
          @update:model-value="clearError"
        />
        <q-input
          v-model="email"
          :rules="emailRule"
          class="q-mt-md"
          dense
          label="Email Address"
          lazy-rules
          outlined
          @update:model-value="clearError"
        />
        <q-input
          v-model="password"
          :rules="passwordRule"
          class="q-mt-md"
          dense
          label="Password"
          lazy-rules
          outlined
          type="password"
          @update:model-value="clearError"
        />
        <q-input
          v-model="confirmPassword"
          :rules="confirmPasswordRule"
          class="q-mt-md"
          dense
          label="Password Confirm"
          lazy-rules
          outlined
          type="password"
          @update:model-value="clearError"
        />
        <q-banner v-if="error" class="text-white bg-red text-center"
          >{{ error }}
        </q-banner>
        <q-btn
          class="full-width q-mt-md"
          color="dark"
          label="Sign up"
          no-caps
          rounded
          size="md"
          type="submit"
        />
      </q-card-section>
      <q-card-section class="text-center q-pt-none">
        <div class="text-grey-8">
          If you already have an account?
          <nuxt-link to="login" class="text-dark text-weight-bold">
            Login
          </nuxt-link>
        </div>
      </q-card-section>
    </q-form>
  </q-card>
</template>

<script setup>
definePageMeta({
  layout: 'guest',
  middleware: ['guest'],
})

const { register } = useFirebase()

const error = ref('')
const name = ref(null)
const email = ref(null)
const password = ref(null)
const confirmPassword = ref(null)

const nameRule = [(val) => !!val || 'Name is required']
const emailRule = [(val, rule) => rule.email(val) || 'Email is not valid']
const passwordRule = [(val) => !!val || 'Password is required']
const confirmPasswordRule = [
  (val) =>
    (!!val && val === confirmPassword.value) || 'Password confirm is not valid',
]

const clearError = () => (error.value = '')

const signUp = async () => {
  try {
    await register(name.value, email.value, password.value)
    navigateTo('/')
  } catch (e) {
    error.value = e.code || e.message
  }
}
</script>
