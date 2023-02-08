/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('playlists_songs', {
    playlist_id: { type: 'varchar(50)', notNull: true },
    song_id: { type: 'varchar(50)', notNull: true },
  });

  pgm.addConstraint(
    'playlists_songs',
    'unique_playlist_id_and_song_id',
    'UNIQUE(playlist_id, song_id)',
  );

  pgm.addConstraint(
    'playlists_songs',
    'fk_playlist_songs.playlist_id_playlists.id',
    'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE',
  );

  pgm.addConstraint(
    'playlists_songs',
    'fk_playlist_songs.song_id_songs.id',
    'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlists_songs', 'unique_playlist_id_and_song_id');
  pgm.dropConstraint('playlists_songs', 'fk_playlist_songs.playlist_id_playlists.id');
  pgm.dropConstraint('playlists_songs', 'fk_playlist_songs.song_id_songs.id');
  pgm.dropTable('playlists_songs');
};
