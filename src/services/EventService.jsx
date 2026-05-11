import api from '.Api'

const eventService = {
  getAll: () =>
    api.get('/events'),

  getUpcoming: () =>
    api.get('/events/upcoming'),

  getEventById: (id) =>
    api.get(`/events/${id}`),

  // alias kept for any other components that use getAllEvents
  getAllEvents: () =>
    api.get('/events'),
}

export default eventService