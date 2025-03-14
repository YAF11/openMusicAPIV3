const autoBind = require('auto-bind'); // Mengimpor autoBind untuk memastikan metode tetap memiliki konteks yang benar

class UsersHandler {
  constructor(service, validator) {
    // Menyimpan instance layanan (service) dan validator yang digunakan untuk mengelola pengguna
    this._service = service;
    this._validator = validator;

    // Mengikat semua metode kelas ke instance ini agar tetap mempertahankan konteksnya
    autoBind(this);
  }

  // Handler untuk menambahkan pengguna baru
  async postUserHandler(request, h) {
    // Memvalidasi payload request agar sesuai dengan aturan yang ditentukan
    this._validator.validateUserPayload(request.payload);

    // Mengambil data pengguna dari body request
    const { username, password, fullname } = request.payload;

    // Menambahkan pengguna ke dalam database melalui service dan mendapatkan ID pengguna yang baru dibuat
    const userId = await this._service.addUser({ username, password, fullname });

    // Mengembalikan respons sukses setelah pengguna berhasil ditambahkan
    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    });

    response.code(201); // Memberikan kode status HTTP 201 (Created)
    return response;
  }

  // Handler untuk mendapatkan detail pengguna berdasarkan ID
  async getUserByIdHandler(request) {
    // Mengambil ID pengguna dari parameter URL
    const { id } = request.params;

    // Mengambil data pengguna berdasarkan ID dari service
    const user = await this._service.getUserById(id);

    // Mengembalikan data pengguna yang ditemukan
    return {
      status: 'success',
      data: {
        user,
      },
    };
  }
}

// Mengekspor kelas UsersHandler agar bisa digunakan di modul lain
module.exports = UsersHandler;
