const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: (request, h) => handler.postPlaylistHandler(request, h),
    options: {
      auth: 'openmusic_api_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: (request) => handler.getPlaylistsHandler(request),
    options: {
      auth: 'openmusic_api_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/playlists/{id}',
    handler: (request, h) => handler.putPlaylistByIdHandler(request, h),
    options: {
      auth: 'openmusic_api_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: (request, h) => handler.deletePlaylistByIdHandler(request, h),
    options: {
      auth: 'openmusic_api_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.getPlaylistSongsByIdHandler(request, h),
    options: {
      auth: 'openmusic_api_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.postPlaylistSongsHandler(request, h),
    options: {
      auth: 'openmusic_api_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: (request) => handler.deletePlaylistSongByIdHandler(request),
    options: {
      auth: 'openmusic_api_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: (request, h) => handler.getPlaylistActivitesByIdHandler(request, h),
    options: {
      auth: 'openmusic_api_jwt',
    },
  },
];

module.exports = routes;
