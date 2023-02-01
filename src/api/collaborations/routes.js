const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: (request, h) => handler.postCollaborationHandler(request, h),
    options: {
      auth: 'openmusic_api_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: (request, h) => handler.deleteCollaborationByIdHandler(request, h),
    options: {
      auth: 'openmusic_api_jwt',
    },
  },
];

module.exports = routes;
