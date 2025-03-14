const { Pool } = require('pg'); // Mengimpor Pool dari pg untuk koneksi ke database PostgreSQL
const InvariantError = require('../../exceptions/InvariantError');

class AuthenticationsService {
  constructor() {
    // Membuat koneksi database menggunakan Pool dari PostgreSQL
    this._pool = new Pool();
  }

  // Menambahkan refresh token ke dalam database
  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)', // Menyimpan token ke dalam tabel authentications
      values: [token],
    };

    await this._pool.query(query); // Mengeksekusi query untuk menyimpan token
  }

  // Memverifikasi apakah refresh token ada dalam database
  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1', // Mengecek apakah token tersedia di database
      values: [token],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Refresh token tidak valid'); // Melempar error jika token tidak ditemukan
    }
  }

  // Menghapus refresh token dari database
  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1', // Menghapus token dari tabel authentications
      values: [token],
    };

    await this._pool.query(query); // Mengeksekusi query untuk menghapus token
  }
}

// Mengekspor kelas AuthenticationsService agar bisa digunakan di modul lain
module.exports = AuthenticationsService;
