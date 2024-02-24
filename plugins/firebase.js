import { initializeApp } from 'firebase/app'
import { VueFire, VueFireAuth } from 'vuefire'

export default defineNuxtPlugin(({ $config, vueApp }) => {
  const firebaseApp = initializeApp({
    apiKey: $config.public.apiKey,
    authDomain: $config.public.authDomain,
    projectId: $config.public.projectId,
    storageBucket: $config.public.storageBucket,
    messagingSenderId: $config.public.messagingSenderId,
    appId: $config.public.appId,
  })

  vueApp.use(VueFire, {
    firebaseApp,
    modules: [VueFireAuth()],
  })
})
