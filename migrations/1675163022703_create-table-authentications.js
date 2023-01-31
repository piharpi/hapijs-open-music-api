/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('authentications', {
    token: {
      type: 'text',
      unique: true,
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('authentications');
};
