const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    const { rows } = await this._pool.query({
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    });

    if (!rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan.');
    }

    return rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT pl.id, pl.name, us.username 
               FROM playlists pl
          LEFT JOIN collaborations cl ON cl.playlist_id = pl.id
          LEFT JOIN users us ON pl.owner = us.id
              WHERE pl.owner = $1 OR cl.user_id = $1
           GROUP BY pl.id, us.username`,
      values: [owner],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }

  async getPlaylistById(playlistId) {
    const query = {
      text: `SELECT pl.id, pl.name, us.username
               FROM playlists pl
               JOIN users us ON pl.owner = us.id
              WHERE pl.id = $1`,
      values: [playlistId],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan.');
    }

    return rows[0];
  }

  async editPlaylistById(id, { name }) {
    const { rowCount } = await this._pool.query({
      text: 'UPDATE playlists SET name = $1 WHERE id = $2 RETURNING id',
      values: [name, id],
    });

    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui playlist. Id tidak ditemukan.');
    }
  }

  async deletePlaylistById(id) {
    const { rowCount } = await this._pool.query({
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    });

    if (!rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan.');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const { rows, rowCount } = await this._pool.query({
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    });

    if (!rowCount) {
      throw new NotFoundError('Playlists tidak ditemukan');
    }

    const playlist = rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async getPlaylistSongsById(id) {
    const playlist = await this.getPlaylistById(id);

    const { rows } = await this._pool.query({
      text: `SELECT songs.id, songs.title, songs.performer
               FROM songs
         RIGHT JOIN playlists_songs 
                 ON songs.id = playlists_songs.song_id
              WHERE playlist_id = $1`,
      values: [playlist.id],
    });

    return { ...playlist, songs: rows };
  }

  async addPlaylistSongs(playlistId, songId) {
    const { rows } = await this._pool.query({
      text: 'INSERT INTO playlists_songs VALUES($1, $2) RETURNING song_id',
      values: [playlistId, songId],
    });

    if (!rows[0].song_id) {
      throw new InvariantError('Lagu gagal ditambahkan di playlist.');
    }
  }

  async deletePlaylistSongById(playlistId, songId) {
    const { rowCount } = await this._pool.query({
      text: `DELETE FROM playlists_songs 
              WHERE playlist_id = $1 AND song_id = $2 RETURNING song_id`,
      values: [playlistId, songId],
    });

    if (!rowCount) {
      throw new NotFoundError('Lagu gagal dihapus dari playlist. Id tidak ditemukan.');
    }
  }
}

module.exports = PlaylistsService;
