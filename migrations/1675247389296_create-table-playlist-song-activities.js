/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('playlist_song_activities', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'varchar(50)',
      notNull: true,
    },
    song_id: {
      type: 'varchar(50)',
      notNull: true,
    },
    user_id: {
      type: 'varchar(50)',
      notNull: true,
    },
    action: {
      type: 'varchar(10)',
      notNull: true,
    },
    time: {
      type: 'text',
      notNull: true,
    },
  });

  pgm.addConstraint(
    'playlist_song_activities',
    'fk_playlist_song_activities.playlist_id_playlists.id',
    'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE',
  );

  pgm.addConstraint(
    'playlist_song_activities',
    'fk_playlist_song_activities.song_id_songs.id',
    'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE',
  );

  pgm.addConstraint(
    'playlist_song_activities',
    'fk_playlist_song_activities.user_id_users.id',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint(
    'playlist_song_activities',
    'fk_playlist_song_activities.playlist_id_playlists.id',
  );
  pgm.dropConstraint('playlist_song_activities', 'fk_playlist_song_activities.song_id_songs.id');
  pgm.dropConstraint('playlist_song_activities', 'fk_playlist_song_activities.user_id_users.id');
  pgm.dropTable('playlist_song_activities');
};
