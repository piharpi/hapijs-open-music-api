const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
});

const PlaylistSongPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  songId: Joi.string().required(),
});

module.exports = { PlaylistPayloadSchema, PlaylistSongPayloadSchema };
