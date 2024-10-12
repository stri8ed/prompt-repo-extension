

export function bytesToSize(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) {
    return '0 Byte'
  }
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)).toString())
  if (i === 0) {
    return `${bytes} ${sizes[i]}`
  }
  const val = bytes / (1000 ** i);
  if (val % 1 === 0) {
    return `${val} ${sizes[i]}`
  }
  return `${val.toFixed(1)} ${sizes[i]}`
}