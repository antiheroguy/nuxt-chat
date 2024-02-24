import { useFirestore, useFirebaseAuth, useFirebaseApp } from 'vuefire'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { getMessaging, onMessage, getToken } from 'firebase/messaging'
import {
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  doc,
  query,
  collection,
  where,
  arrayUnion,
  orderBy,
  startAfter,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore'
import dayjs from 'dayjs'
import { LIMIT_CHAT_MESSAGES } from '~/constants'
import { getHumanizeTime, getAvatarByName } from '@/utils'

export const useFirebase = () => {
  const auth = useFirebaseAuth()
  const db = useFirestore()
  const app = useFirebaseApp()
  const messaging = getMessaging(app)
  const chatStore = useChatStore()
  const authStore = useAuthStore()
  const authRef = authStore.user?.uid
    ? doc(db, 'users', authStore.user.uid)
    : null

  const getMessagingToken = async () => {
    const token = await getToken(messaging, {
      vapidKey: process.env.vapidKey,
    })

    await updateDoc(authRef, { token })

    return messaging
  }

  const receiveMessage = onMessage

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const register = async (name, email, password) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    const userRef = doc(db, 'users', user.uid)
    await setDoc(userRef, {
      uid: user.uid,
      name: name,
      email: user.email,
      token: null,
    })
  }

  const logout = () => signOut(auth)

  const getAuthUser = () => getDoc(authRef)

  const getListGroups = async () => {
    const data = await getDocs(
      query(
        collection(db, 'groups'),
        where('members', 'array-contains', authRef),
        orderBy('updated_at', 'desc'),
      ),
    )
    return data.docs.map((d) => {
      return {
        id: d.id,
        ...d.data(),
      }
    })
  }

  const listenGroups = (callback) => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'groups'),
        where('members', 'array-contains', authRef),
        where('updated_at', '>=', Timestamp.fromDate(new Date())),
        orderBy('updated_at', 'desc'),
      ),
      (snapshot) => callback(snapshot),
    )
    chatStore.addUnsubscribes(unsubscribe)
    return unsubscribe
  }

  const addGroup = async (members, name) => {
    const currentTime = Timestamp.fromDate(new Date())
    const groupId = `${authStore.user.uid}${dayjs().valueOf()}`
    if (members.length === 1) {
      const guestRef = doc(db, 'users', members[0].id)

      const authGroups = await getDocs(
        query(
          collection(db, 'groups'),
          where('members', 'array-contains', authRef),
        ),
      )
      const guestGroups = await getDocs(
        query(
          collection(db, 'groups'),
          where('members', 'array-contains', guestRef),
        ),
      )
      const directGroup = authGroups.docs.filter((docA) =>
        guestGroups.docs.some((docB) => docB.id === docA.id),
      )

      const group = chatStore.findGroup(directGroup?.[0]?.id)
      if (group) {
        return directGroup?.[0]?.id
      }

      await setDoc(doc(db, 'groups', groupId), {
        created_at: currentTime,
        updated_at: currentTime,
        last_message: null,
        name: name || null,
        owner: authRef,
        members: arrayUnion(authRef, guestRef),
      })

      return groupId
    } else {
      const memberRefs = members.map((member) => doc(db, 'users', member.id))
      await setDoc(doc(db, 'groups', groupId), {
        created_at: currentTime,
        updated_at: currentTime,
        last_message: null,
        name: name || null,
        owner: authRef,
        members: arrayUnion(...memberRefs, authRef),
      })

      return groupId
    }
  }

  const parseGroup = async (group) => {
    const id = group.id
    let name = group.name

    const isDirectChat = group.members.length === 2
    if (isDirectChat && !name) {
      const guestId = group.members
        .map((item) => item.id)
        .find((item) => item !== authStore.user.uid)
      const guestDoc = await getDoc(doc(db, 'users', guestId))
      name = guestDoc.data().name
    }

    const image = getAvatarByName(name)

    let lastMessage = null
    let isRead = true
    if (group.last_message) {
      const message = await getDoc(group.last_message)
      lastMessage = message.data().content
      isRead = message
        .data()
        .readBy?.some((item) => item.id === authStore.user.uid)
    }

    const createdAt = getHumanizeTime(group.created_at.toDate())
    const updatedAt = getHumanizeTime(group.updated_at.toDate())
    return {
      id,
      name,
      image,
      lastMessage,
      isRead,
      createdAt,
      updatedAt,
    }
  }

  const getListMessages = async (lastMessage) => {
    const groupRef = doc(db, 'groups', chatStore.currentGroupId)
    const queryParams = [
      collection(db, 'messages'),
      where('group', '==', groupRef),
      orderBy('created_at', 'desc'),
      limit(LIMIT_CHAT_MESSAGES),
    ]
    if (lastMessage) {
      queryParams.push(startAfter(lastMessage))
    }

    const documents = await getDocs(query(...queryParams))

    const results = []
    for (const item of documents.docs) {
      const data = item.data()
      const sender = await getDoc(data.sender)

      results.push({
        id: item.id,
        ...data,
        sender: sender.data(),
        is_owner: sender.id === authStore.user.uid,
        created_at: getHumanizeTime(data.created_at.toDate()),
        doc: item,
      })
    }

    return results
  }

  const listenMessages = (groupId, callback) => {
    const groupRef = doc(db, 'groups', groupId)
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'messages'),
        where('group', '==', groupRef),
        where('created_at', '>=', Timestamp.fromDate(new Date())),
        orderBy('created_at', 'desc'),
      ),
      async (snapshot) => {
        const result = []
        const chances = snapshot.docChanges().reverse()
        for (const change of chances) {
          const data = change.doc.data()
          const sender = await getDoc(data.sender)
          if (change.type === 'added') {
            result.push({
              id: change.doc.id,
              ...data,
              sender: sender.data(),
              is_owner: sender.id === authStore.user.uid,
              created_at: getHumanizeTime(data.created_at.toDate()),
            })
          }
        }

        callback(result)
      },
    )
    chatStore.addUnsubscribes(unsubscribe)
    return unsubscribe
  }

  const sendMessage = async (message) => {
    const messageId = `${authStore.user.uid}${dayjs().valueOf()}`
    const messageRef = doc(db, 'messages', messageId)
    const currentGroupRef = doc(db, 'groups', chatStore.currentGroupId)
    const currentTime = Timestamp.fromDate(new Date())

    await setDoc(messageRef, {
      content: message,
      created_at: currentTime,
      group: currentGroupRef,
      sender: authRef,
      readBy: [],
    })

    await updateDoc(currentGroupRef, {
      last_message: messageRef,
      updated_at: currentTime,
    })

    return messageId
  }

  const readMessage = async (id, readBy) => {
    if (readBy?.some((item) => item.id === authStore.user.uid)) {
      return
    }

    await updateDoc(doc(db, 'messages', id), {
      readBy: arrayUnion(authRef),
    })
  }

  const getListOtherUsers = async () => {
    const users = await getDocs(
      query(collection(db, 'users'), where('uid', '!=', authStore.user.uid)),
    )
    return users.docs.map((item) => {
      return {
        id: item.id,
        label: item.data().name,
        value: item.data().name,
        data: item.data(),
      }
    })
  }

  return {
    getMessagingToken,
    receiveMessage,
    login,
    register,
    logout,
    getAuthUser,
    getListGroups,
    listenGroups,
    addGroup,
    parseGroup,
    getListMessages,
    listenMessages,
    sendMessage,
    readMessage,
    getListOtherUsers,
  }
}
