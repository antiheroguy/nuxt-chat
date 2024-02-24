import { getCurrentUser } from 'vuefire'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = await getCurrentUser()
  if (!user) {
    return navigateTo('/login')
  }

  authStore.setUser(user)
})
