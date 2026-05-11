import api from '.Api'

const complaintService = {
  
  create: (formData) =>
  api.post(
    '/complaints',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000,
    }
  ),

  // Alias for backward compatibility
  createComplaint: (formData) =>
    api.post('/complaints', formData),

  // Get all complaints for logged-in user
  getMyComplaints: () =>
    api.get('/complaints/mine'),

  // Alias used by Dashboard
  getMine: () =>
    api.get('/complaints/mine'),

  // Get single complaint by id
  getComplaintById: (id) =>
    api.get(`/complaints/${id}`),

  // Short alias for getComplaintById
  getById: (id) =>
    api.get(`/complaints/${id}`),
}

export default complaintService