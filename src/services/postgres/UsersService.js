const { Pool } = require('pg'); // Mengimpor modul Pool dari pg untuk koneksi ke database PostgreSQL
const { nanoid } = require('nanoid'); // Mengimpor nanoid untuk membuat ID unik
const bcrypt = require('bcrypt'); // Mengimpor bcrypt untuk enkripsi password
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService {
  constructor() {
    this._pool = new Pool(); // Membuat koneksi pool ke database PostgreSQL
  }

  // Fungsi untuk menambahkan pengguna baru ke database
  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username); // Memeriksa apakah username sudah digunakan

    const id = `user-${nanoid(16)}`; // Membuat ID unik untuk user
    const hashedPassword = await bcrypt.hash(password, 10); // Mengenkripsi password sebelum disimpan

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id', // Query untuk menambahkan user ke database
      values: [id, username, hashedPassword, fullname],
    };

    const result = await this._pool.query(query); // Menjalankan query ke database

    if (!result.rows.length) {
      throw new InvariantError('User gagal ditambahkan'); // Melempar error jika gagal menambahkan user
    }

    return result.rows[0].id; // Mengembalikan ID dari user yang telah ditambahkan
  }

  // Fungsi untuk memeriksa apakah username sudah digunakan sebelumnya
  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1', // Query untuk mencari username di database
      values: [username],
    };

    const result = await this._pool.query(query); // Menjalankan query ke database

    if (result.rows.length > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.'); // Melempar error jika username sudah ada
    }
  }

  // Fungsi untuk mengambil informasi pengguna berdasarkan ID
  async getUserById(userId) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1', // Query untuk mengambil data user berdasarkan ID
      values: [userId],
    };

    const result = await this._pool.query(query); // Menjalankan query ke database

    if (!result.rows.length) {
      throw new NotFoundError('User tidak ditemukan'); // Melempar error jika user tidak ditemukan
    }

    return result.rows[0]; // Mengembalikan data user yang ditemukan
  }

  // Fungsi untuk memverifikasi kredensial pengguna saat login
  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1', // Query untuk mencari user berdasarkan username
      values: [username],
    };

    const result = await this._pool.query(query); // Menjalankan query ke database

    if (!result.rows.length) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah'); // Melempar error jika username tidak ditemukan
    }

    const { id, password: hashedPassword } = result.rows[0]; // Mengambil ID dan password terenkripsi dari hasil query

    const match = await bcrypt.compare(password, hashedPassword); // Membandingkan password yang dimasukkan dengan password di database

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah'); // Melempar error jika password tidak cocok
    }

    return id; // Mengembalikan ID pengguna jika kredensial benar
  }
}

module.exports = UsersService; // Mengekspor kelas UsersService agar dapat digunakan di file lain
