import request from './request'

export function getEvents() {
  return request.get('/events')
}

export function markAsRead(eventId) {
  return request.put(`/events/${eventId}/read`)
}

export function markAllAsRead() {
  return request.put('/events/read-all')
}

export function deleteEvent(eventId) {
  return request.delete(`/events/${eventId}`)
}
