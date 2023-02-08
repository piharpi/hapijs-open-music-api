const config = require('../../utils/config');

class AlbumsHandler {
  constructor(albumsService, storageService, albumLikesService, validator) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._albumsLikedService = albumLikesService;
    this._validator = validator;
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const albumId = await this._albumsService.addAlbum(request.payload);
    return h
      .response({
        status: 'success',
        data: {
          albumId,
        },
      })
      .code(201);
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;

    const album = await this._albumsService.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._albumsService.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui.',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._albumsService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus.',
    };
  }

  async postAlbumCoverHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    this._validator.validateAlbumImagePayload(cover.hapi.headers);
    await this._albumsService.verifyAlbumExists(id);

    const filename = await this._storageService.writeFile(cover, cover.hapi, id);
    const coverUrl = `http://${config.app.host}:${config.app.port}/upload/images/${filename}`;

    await this._albumsService.editAlbumCoverUrlById(id, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });

    response.code(201);
    return response;
  }

  async postAlbumLikeByIdHandler(request, h) {
    const { userCredentialId: userId } = request.auth.credentials;
    const { id: albumId } = request.params;
    const album = { userId, albumId };

    this._validator.validateAlbumLikePayload(album);
    await this._albumsService.verifyAlbumExists(albumId);

    const albumLikeExist = await this._albumsLikedService.toggleLikeAlbum(album);

    return h
      .response({
        status: 'success',
        message: albumLikeExist ? 'Batal suka berhasil' : 'Suka berhasil',
      })
      .code(201);
  }

  async getAlbumLikeByIdHandler(request, h) {
    const { id: albumId } = request.params;

    await this._albumsService.verifyAlbumExists(albumId);

    const { likes, cached } = await this._albumsLikedService.getAlbumLikes(albumId);

    const response = h
      .response({
        status: 'success',
        data: { likes },
      })
      .code(200);

    if (cached) response.header('X-Data-Source', 'cache');

    return response;
  }
}

module.exports = AlbumsHandler;
