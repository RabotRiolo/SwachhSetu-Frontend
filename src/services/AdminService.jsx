import api from './Api'

const adminService = {

  // ── Dashboard ────────────────────────────────────────────
  getDashboardStats: () =>
    api.get('/admin/dashboard/stats'),

  // ── Complaints ───────────────────────────────────────────
  getAllComplaints: () =>
    api.get('/admin/complaints'),

  getComplaintById: (id) =>
    api.get(`/admin/complaints/${id}`),

  // Backend: POST /api/admin/assignments with { complaintId, teamId }
  assignTeam: (complaintId, data) =>
    api.post('/admin/assignments', {
      complaintId: Number(complaintId),
      teamId: data.teamId,
    }),

  // Backend: PATCH /api/admin/complaints/{id}/status?status=PENDING
  updateComplaintStatus: (complaintId, data) =>
    api.patch(`/admin/complaints/${complaintId}/status`, {}, {
      params: { status: data.status },
    }),

  deleteComplaint: (id) =>
    api.delete(`/admin/complaints/${id}`),

  // ── Teams ────────────────────────────────────────────────
  getAllTeams: () =>
    api.get('/admin/teams'), 

  getTeamById: (id) =>
    api.get(`/admin/teams/${id}`),

  createTeam: (data) =>
    api.post('/admin/teams', data),

  updateTeam: (id, data) =>
    api.put(`/admin/teams/${id}`, data),

  deleteTeam: (id) =>
    api.delete(`/admin/teams/delete/${id}`),

  // ── Events ───────────────────────────────────────────────
  getAllEvents: () =>
    api.get('/events'),

  createEvent: (data) =>
    api.post('/admin/events', data),

  deleteEvent: (id) =>
    api.delete(`/admin/events/${id}`),

  // ── Articles ─────────────────────────────────────────────
  getAllArticles: () =>
    api.get('/articles'),

  createArticle: (data) =>
    api.post('/admin/articles', data),

  deleteArticle: (id) =>
    api.delete(`/admin/articles/${id}`),
}

export default adminService