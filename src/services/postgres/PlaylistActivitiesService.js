const { Pool } = require('pg');
const { nanoid } = require('nanoid');

class PlaylistActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addHistory({ playlistId, songId, userId, action }) {
    const id = `playlist-event-${nanoid(16)}`;
    const timeAt = new Date().toDateString();

    await this._pool.query({
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, timeAt],
    });
  }

  async addedSongActivity({ playlistId, songId, userId }) {
    await this.addHistory({ playlistId, songId, userId, action: 'add' });
  }

  async deletedSongActivity({ playlistId, songId, userId }) {
    await this.addHistory({ playlistId, songId, userId, action: 'delete' });
  }

  async getPlaylistActivitiesById(playlistId) {
    const { rows } = await this._pool.query({
      text: `SELECT u.username, s.title, action, time
             FROM playlist_song_activities psa
             JOIN users u ON u.id = psa.user_id
             JOIN songs s ON s.id = psa.song_id
             WHERE playlist_id = $1`,
      values: [playlistId],
    });

    return rows;
  }
}

module.exports = PlaylistActivitiesService;
