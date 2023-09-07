class ExportsHandler {
  constructor(service, validator, servicePlaylists) {
    this._service = service;
    this._validator = validator;
    this._servicePlaylists = servicePlaylists;

    this.postExportplaylistHandler = this.postExportplaylistHandler.bind(this);
  }

  async postExportplaylistHandler(request, h) {
    await this._validator.validateExportPlaylistPayload(request.payload);

    const { playlistId } = request.params;
    const credentialId = request.auth.credentials.id;
    await this._servicePlaylists.verifyPlaylistAccess(playlistId, credentialId);

    // Cek playlist

    const message = {
      playlistId: request.params.playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._service.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });

    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
