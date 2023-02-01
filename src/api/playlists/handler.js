class PlaylistsHandler {
  constructor(playlistsService, songsService, playlistActivitiesService, validator) {
    this._playlistActivitiesService = playlistActivitiesService;
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist(name, credentialId);

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async putPlaylistByIdHandler(request) {
    this._validator.validatePlaylistPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    await this._playlistsService.editPlaylistById(id, request.payload);

    return {
      status: 'success',
      message: 'Playlist berhasil diperbarui.',
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    await this._playlistsService.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus.',
    };
  }

  // playlist with songs
  async getPlaylistSongsByIdHandler(request) {
    const { id } = request.params;

    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    const playlist = await this._playlistsService.getPlaylistSongsById(id);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async getPlaylistActivitesByIdHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

    const activities = await this._playlistActivitiesService.getPlaylistActivitiesById(playlistId);

    return h.response({
      status: 'success',
      data: { playlistId, activities },
    });
  }

  async postPlaylistSongsHandler(request, h) {
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
    await this._validator.validatePlaylistSongPayload({ playlistId, songId });
    await this._songsService.getSongById(songId);

    await this._playlistsService.addPlaylistSongs(playlistId, songId);

    await this._playlistActivitiesService.addedSongActivity({ playlistId, songId, userId });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan diplaylist',
    });

    response.code(201);
    return response;
  }

  async deletePlaylistSongByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: userId } = request.auth.credentials;

    await this._validator.validatePlaylistSongPayload({ playlistId, songId });
    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

    await this._playlistsService.deletePlaylistSongById(playlistId, songId);

    await this._playlistActivitiesService.deletedSongActivity({ playlistId, songId, userId });

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist.',
    };
  }
}

module.exports = PlaylistsHandler;
