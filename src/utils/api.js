export const getApiUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  if (path.startsWith('/')) {
    return `${baseUrl}${path}`
  }
  return path
}
