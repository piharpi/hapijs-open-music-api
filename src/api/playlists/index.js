const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.2.0',
  register: async (
    server,
    { playlistsService, songsService, playlistActivitiesService, validator },
  ) => {
    const playlistsHandler = new PlaylistsHandler(
      playlistsService,
      songsService,
      playlistActivitiesService,
      validator,
    );
    server.route(routes(playlistsHandler));
  },
};
