const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, performer, genre, duration, albumId }) {
    const id = `song-${nanoid(16)}`;

    const { rows } = await this._pool.query({
      text: `INSERT INTO songs 
             VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      values: [id, title, year, performer, genre, duration, albumId],
    });

    if (!rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getSongs({ title = '', performer = '' }) {
    const query = {
      text: `SELECT id, title, performer 
               FROM songs 
              WHERE title ILIKE '%' || $1 ||'%' AND performer ILIKE '%' || $2 || '%'`,
      values: [title, performer],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }

  async getSongById(id) {
    const query = {
      text: `SELECT id, title, year, performer, genre, duration, album_id 
             FROM songs WHERE id = $1`,
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan.');
    }

    return rows[0];
  }

  async editSongById(id, { title, year, performer, genre, duration, albumId }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: `UPDATE songs 
                SET title = $1, 
                    year = $2, 
                    performer = $3, 
                    genre = $4, 
                    duration = $5, 
                    album_id = $6, 
                    updated_at = $7 
              WHERE id = $8 RETURNING id`,
      values: [title, year, performer, genre, duration, albumId, updatedAt, id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan.');
    }
  }

  async deleteSongById(id) {
    const { rowCount } = await this._pool.query({
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    });

    if (!rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan.');
    }
  }
}

module.exports = SongsService;
