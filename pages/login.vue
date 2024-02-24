<template>
  <q-card class="q-pa-md shadow-2 auth-card" bordered>
    <q-form class="q-gutter-md" @submit="signIn">
      <q-card-section class="text-center">
        <div class="text-grey-9 text-h5 text-weight-bold">Sign in</div>
        <div class="text-grey-8">Sign in below to access your account</div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="email"
          :rules="emailRule"
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
        <q-banner v-if="error" class="text-white bg-red text-center"
          >{{ error }}
        </q-banner>
        <q-btn
          class="full-width q-mt-md"
          color="dark"
          label="Sign in"
          no-caps
          rounded
          size="md"
          type="submit"
        />
      </q-card-section>
      <q-card-section class="text-center q-pt-none">
        <div class="text-grey-8">
          Don't have an account yet?
          <nuxt-link to="register" class="text-dark text-weight-bold">
            Sign up
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

const { login } = useFirebase()

const error = ref('')
const email = ref('')
const password = ref('')

const emailRule = [(val, rule) => rule.email(val) || 'Email is not valid']
const passwordRule = [(val) => !!val || 'Password is required']

const clearError = () => (error.value = '')

const signIn = async () => {
  try {
    await login(email.value, password.value)
    navigateTo('/')
  } catch (e) {
    error.value = e.code || e.message
  }
}
</script>
