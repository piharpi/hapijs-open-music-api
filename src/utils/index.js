/* eslint-disable consistent-return */
const mapDbToSongs = ({ song_id: songId, title, performer }) => {
  if (songId != null) {
    return {
      id: songId,
      title,
      performer,
    };
  }
};

module.exports = { mapDbToSongs };
