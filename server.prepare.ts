import fs from 'fs'
import dotenv from 'dotenv'
import { defineNuxtPrepareHandler } from 'nuxt-prepare/config'

dotenv.config()

export default defineNuxtPrepareHandler(async () => {
  const firebaseEnv = JSON.stringify(
    {
      API_KEY: process.env.API_KEY,
      AUTH_DOMAIN: process.env.AUTH_DOMAIN,
      PROJECT_ID: process.env.PROJECT_ID,
      STORAGE_BUCKET: process.env.STORAGE_BUCKET,
      MESSAGING_SENDER_ID: process.env.MESSAGING_SENDER_ID,
      APP_ID: process.env.APP_ID,
    },
    null,
    '\t',
  )

  fs.writeFileSync('./public/swenv.js', `const env = ${firebaseEnv}`)

  return {
    ok: true,
  }
})
