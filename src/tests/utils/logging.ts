export function log(message: string) {
  const timestamp = Date.now() / 1000
  console.log(`[${timestamp}][DEBUG]: ${message}`)
}
