const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { albumMapDBToModel } = require('../../utils');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();

    this._cacheService = cacheService;  
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1,$2,$3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT id,name,year,cover_url FROM albums WHERE id = $1',
      values: [id],
    };

    const resultAlbum = await this._pool.query(queryAlbum);

    if (!resultAlbum.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const resultAlbumMapped = resultAlbum.rows.map(albumMapDBToModel)[0];

    const songsQuery = {
      text: 'SELECT id,title,performer FROM songs WHERE "album_id" = $1',
      values: [id],
    };

    const songsResult = await this._pool.query(songsQuery);

    const result = {
      ...resultAlbumMapped,
      songs: songsResult.rows,
    };

    return result;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async addCoverAlbum(filename,albumId){
    
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [filename,albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Cover gagal ditambahkan');
    }
  }

  async verifyLikeAlbum(albumId,userId){
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId,userId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length) {
      throw new InvariantError('Gagal menambahkan like. Like sudah ada');
    }
  }

  async addLikeAlbum(albumId,userId){
    const id = `like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1,$2,$3) RETURNING id',
      values: [id,albumId,userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Like gagal ditambahkan');
    }

    await this._cacheService.delete(`album:${albumId}`);

    return result.rows[0].id;
  }

  async countLikeAlbum(albumId){
    try{
      const result = await this._cacheService.get(`album:${albumId}`);
      return {likes:JSON.parse(result),isFromCache:true};
    }catch(error){
      const query = {
        text: 'SELECT COUNT(album_id) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
  
      const result = await this._pool.query(query);
  
      if (!result.rows[0].count) {
        throw new InvariantError('Album tidak ditemukan');
      }
      await this._cacheService.set(`album:${albumId}`, result.rows[0].count);
      return {likes:result.rows[0].count,isFromCache:false};
    }
  }

  async deleteLikeAlbum(albumId,userId){
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId,userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Like gagal dihapus');
    }

    await this._cacheService.delete(`album:${albumId}`);

    return result.rows[0].id;
  }
}

module.exports = AlbumsService;
