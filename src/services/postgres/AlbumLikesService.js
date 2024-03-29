const { Pool } = require('pg');
const { nanoid } = require('nanoid');

class AlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async toggleLikeAlbum({ userId, albumId }) {
    const { rowCount } = await this._pool.query({
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    });

    const deleteQuery = {
      text: `DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2`,
      values: [userId, albumId],
    };

    const insertQuery = {
      text: `INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id`,
      values: [`likes-${nanoid(16)}`, userId, albumId],
    };

    const query = rowCount ? deleteQuery : insertQuery;
    await this._pool.query(query);

    this._cacheService.del(`likes:${albumId}`);

    return rowCount;
  }

  async getAlbumLikes(albumId) {
    let rowCount = 0;

    try {
      rowCount = parseInt(await this._cacheService.get(`likes:${albumId}`), 10);
      return { likes: rowCount, cached: true };
    } catch (_) {
      ({ rowCount } = await this._pool.query({
        text: `SELECT id FROM user_album_likes WHERE album_id = $1`,
        values: [albumId],
      }));

      await this._cacheService.set(`likes:${albumId}`, rowCount);
    }

    return { likes: rowCount };
  }
}

module.exports = AlbumLikesService;
