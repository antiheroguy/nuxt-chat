import admin from 'firebase-admin'
import dotenv from 'dotenv'

dotenv.config()

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_CREDENTIALS)),
})

export const handler = async ({ queryStringParameters: { id } }) => {
  try {
    if (!id) {
      throw new Error('Missing id')
    }

    const db = admin.firestore()
    const messaging = admin.messaging()

    const messageRef = db.collection('messages').doc(id)
    const messageDoc = await messageRef.get()
    if (!messageDoc.exists) {
      throw new Error('Message not found')
    }

    const messageData = messageDoc.data()
    const groupDoc = await messageData.group.get()
    if (!groupDoc.exists) {
      throw new Error('Group not found')
    }

    const groupData = groupDoc.data()
    const members = await Promise.all(
      groupData.members
        .filter((member) => member.id !== messageData.sender.id)
        .map((member) => member.get()),
    )
    const tokens = members
      .map((member) => member.data().token)
      .filter((token) => token)

    if (tokens.length) {
      messaging.sendMulticast({
        tokens,
        notification: {
          title: groupData.name || 'New Message',
          body: messageData.content,
        },
      })
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'OK',
      }),
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: e.message,
      }),
    }
  }
}
