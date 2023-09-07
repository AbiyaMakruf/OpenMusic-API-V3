class UploadsHandler{
    constructor(service, validator,albumService){
        this._service = service;
        this._validator = validator;
        this._albumService = albumService;

        this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
    }

    async postUploadImageHandler(request, h){
        const {cover} = request.payload;
        const albumId = request.params.id;
        this._validator.validateImageHeaders(cover.hapi.headers);
        
        const filename = await this._service.writeFile(cover, cover.hapi);
        await this._albumService.addCoverAlbum(filename,albumId);
        const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`

        //TODO
        //Simpan ke database
        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
        });

        response.code(201);
        return response;
    }
}

module.exports = UploadsHandler;