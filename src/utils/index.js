const albumMapDBToModel = ({
    id, name, year, cover_url,
  }) => {

    if(cover_url !== null){
        cover_url = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${cover_url}`
    };

    return {
      id,
      name,
      year,
      coverUrl: cover_url,
    };
};
  

  
module.exports = { albumMapDBToModel};