const Joi = require('joi');

const currentYear = new Date().getFullYear();

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(currentYear).required(),
});

const AlbumImageHeadersSchema = Joi.object({
  'content-type': Joi.string()
    .valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp')
    .required(),
}).unknown();

const AlbumLikesSchema = Joi.object({
  userId: Joi.string().required(),
  albumId: Joi.string().required(),
});

module.exports = { AlbumPayloadSchema, AlbumImageHeadersSchema, AlbumLikesSchema };
