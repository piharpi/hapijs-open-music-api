const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDbToSongs } = require('../../utils');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const { rows } = await this._pool.query({
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [id, name, year, createdAt],
    });

    if (!rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan.');
    }

    return rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: `SELECT al.id AS album_id, al.name, al.year, so.id AS song_id, so.title, so.performer 
               FROM albums al 
          LEFT JOIN songs so 
                 ON so.album_id = al.id 
              WHERE al.id = $1`,
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Album tidak ditemukan.');
    }

    const { album_id: albumId, name, year } = rows[0];

    return {
      id: albumId,
      name,
      year,
      songs: rows.map(mapDbToSongs).filter(Boolean),
    };
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();

    const { rowCount } = await this._pool.query({
      text: `UPDATE albums 
                SET name = $1, 
                    year = $2,
                    updated_at = $3 
              WHERE id = $4 
          RETURNING id`,
      values: [name, year, updatedAt, id],
    });

    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan.');
    }
  }

  async deleteAlbumById(id) {
    const { rowCount } = await this._pool.query({
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    });

    if (!rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan.');
    }
  }
}

module.exports = AlbumsService;
