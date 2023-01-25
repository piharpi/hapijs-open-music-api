const mapDbToSongs = ({ song_id, title, performer }) => {
  if (song_id != null) {
    return {
      id: song_id,
      title,
      performer,
    };
  }
};

module.exports = { mapDbToSongs };
