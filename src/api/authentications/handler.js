const autoBind = require('auto-bind'); // Mengimpor autoBind untuk mengikat konteks metode dalam kelas

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    // Menyimpan layanan yang digunakan dalam autentikasi
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    // Mengikat semua metode kelas ke instance ini agar tetap mempertahankan konteksnya
    autoBind(this);
  }

  // Handler untuk menangani proses login dan pembuatan token
  async postAuthenticationHandler(request, h) {
    // Memvalidasi payload yang diterima dari request
    this._validator.validatePostAuthenticationPayload(request.payload);

    // Mengambil username dan password dari request
    const { username, password } = request.payload;

    // Memverifikasi kredensial pengguna dan mendapatkan ID pengguna
    const id = await this._usersService.verifyUserCredential(username, password);

    // Membuat access token dan refresh token
    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });

    // Menyimpan refresh token ke dalam sistem
    await this._authenticationsService.addRefreshToken(refreshToken);

    // Mengembalikan respons sukses dengan token yang dihasilkan
    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201); // Memberikan kode status HTTP 201 (Created)
    return response;
  }

  // Handler untuk memperbarui access token menggunakan refresh token
  async putAuthenticationHandler(request) {
    // Memvalidasi payload yang diterima dari request
    this._validator.validatePutAuthenticationPayload(request.payload);

    // Mengambil refresh token dari request
    const { refreshToken } = request.payload;

    // Memverifikasi apakah refresh token valid
    await this._authenticationsService.verifyRefreshToken(refreshToken);

    // Mendekode refresh token untuk mendapatkan ID pengguna
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

    // Membuat access token baru
    const accessToken = this._tokenManager.generateAccessToken({ id });

    // Mengembalikan respons sukses dengan access token yang baru
    return {
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }

  // Handler untuk menghapus refresh token (logout)
  async deleteAuthenticationHandler(request) {
    // Memvalidasi payload yang diterima dari request
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    // Mengambil refresh token dari request
    const { refreshToken } = request.payload;

    // Memverifikasi apakah refresh token valid
    await this._authenticationsService.verifyRefreshToken(refreshToken);

    // Menghapus refresh token dari sistem
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    // Mengembalikan respons sukses setelah token berhasil dihapus
    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

// Mengekspor kelas AuthenticationsHandler agar bisa digunakan di modul lain
module.exports = AuthenticationsHandler;
