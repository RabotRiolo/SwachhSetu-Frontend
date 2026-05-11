import api from '.Api'

const articleService = {
  getAll: () =>
    api.get('/articles'),

  getById: (id) =>
    api.get(`/articles/${id}`),

  // alias kept for any other components using getAllArticles
  getAllArticles: () =>
    api.get('/articles'),
}

export default articleService