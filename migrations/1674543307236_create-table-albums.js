/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: { type: 'varchar(30)', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    year: { type: 'smallint', notNull: true },
    created_at: { type: 'text', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'text', notNull: true, default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('albums');
};
