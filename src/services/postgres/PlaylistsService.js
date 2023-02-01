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

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan.');
    }

    return rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username 
             FROM playlists
             LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
             LEFT JOIN users ON playlists.owner = users.id
             WHERE playlists.owner = $1 OR collaborations.user_id = $1
             GROUP BY playlists.id, users.username`,
      values: [owner],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }

  async getPlaylistById(playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
             FROM playlists
             JOIN users
             ON playlists.owner = users.id
             WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan.');
    }

    return rows[0];
  }

  async editPlaylistById(id, { name }) {
    const query = {
      text: 'UPDATE playlists SET name = $1 WHERE id = $2 RETURNING id',
      values: [name, id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui playlist. Id tidak ditemukan.');
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan.');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);

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
    const query = {
      text: 'INSERT INTO playlists_songs VALUES($1, $2) RETURNING song_id',
      values: [playlistId, songId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].song_id) {
      throw new InvariantError('Lagu gagal ditambahkan di playlist.');
    }
  }

  async deletePlaylistSongById(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlists_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING song_id',
      values: [playlistId, songId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Lagu gagal dihapus dari playlist. Id tidak ditemukan.');
    }
  }
}

module.exports = PlaylistsService;
