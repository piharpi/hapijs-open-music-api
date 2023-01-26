/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: { type: 'varchar(30)', primaryKey: true },
    title: { type: 'varchar(255)', notNull: true },
    year: { type: 'smallint', notNull: true },
    performer: { type: 'varchar(255)', notNull: true },
    genre: { type: 'varchar(255)', notNull: true },
    duration: { type: 'smallint', notNull: false },
    album_id: { type: 'varchar(30)', notNull: false },
    created_at: { type: 'text', notNull: true },
    updated_at: { type: 'text', notNull: true },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
