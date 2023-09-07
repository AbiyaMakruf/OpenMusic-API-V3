class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postLikeAlbumByIdHandler = this.postLikeAlbumByIdHandler.bind(this);
    this.deleteLikeAlbumByIdHandler = this.deleteLikeAlbumByIdHandler.bind(this);
    this.getLikeAlbumByIdHandler =  this.getLikeAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const { id } = request.params;

    await this._service.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postLikeAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    //Cek apakah album ada
    await this._service.getAlbumById(id);

    await this._service.verifyLikeAlbum(id, credentialId);
    await this._service.addLikeAlbum(id, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Like berhasil ditambahkan',
    });

    response.code(201);
    return response;
    
  }

  async deleteLikeAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.deleteLikeAlbum(id,credentialId);

    const response = h.response({
      status: 'success',
      message: 'Like berhasil dihapus',
    });

    response.code(200);
    return response;
  }

  async getLikeAlbumByIdHandler(request, h) {
    const {id} = request.params;
    const {likes,isFromCache} = await this._service.countLikeAlbum(id);

    const response = h.response({
      status: 'success',
      data: {
        likes:parseInt(likes),
      }
    });

    response.code(200);

    if (isFromCache) {
      response.header('X-Data-Source', 'cache');
    } else {
      response.header('X-Data-Source', null);
    }

    return response;
  }
}

module.exports = AlbumsHandler;
