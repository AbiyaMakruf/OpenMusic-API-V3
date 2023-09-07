/* eslint-disable camelcase */
const albumMapDBToModel = ({
  id, name, year, cover_url,
}) => {
  let coverUrl = null;
  if (cover_url !== null) {
    coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${cover_url}`;
  }

  return {
    id,
    name,
    year,
    coverUrl,
  };
};

module.exports = { albumMapDBToModel };
