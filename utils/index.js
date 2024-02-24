import dayjs from 'dayjs'

export const getHumanizeTime = (dateTime) =>
  dayjs.duration(dayjs(dateTime).diff(dayjs())).humanize()

export const wordToColor = (word) => {
  let hash = 0
  for (let i = 0; i < word.length; i++) {
    hash = word.charCodeAt(i) + ((hash << 5) - hash)
  }

  return ('00000' + (hash & 0xffffff).toString(16)).slice(-6)
}

export const getContrastColor = (hexColor) => {
  const r = parseInt(hexColor.substring(0, 2), 16)
  const g = parseInt(hexColor.substring(2, 4), 16)
  const b = parseInt(hexColor.substring(4, 6), 16)

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5 ? '000' : 'fff'
}

export const getAvatarByName = (name) => {
  const firstLetter = Array.from(name)[0]
  const backgroundColor = wordToColor(name)
  const textColor = getContrastColor(backgroundColor)
  return `https://placehold.co/40x40/${backgroundColor}/${textColor}?text=${firstLetter}`
}
