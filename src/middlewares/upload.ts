import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    // Sanitasi nama file: spasi jadi underscore & hapus karakter khusus kecuali titik
    const sanitizedName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_\.]/g, "");

    // Tambahkan timestamp agar unik
    const timestamp = Date.now();
    const finalFilename = `${timestamp}-${sanitizedName}`;

    // Simpan original filename di req untuk disimpan ke DB jika perlu
    if (!req.body) req.body = {};
    req.body.originalFilename = file.originalname;

    cb(null, finalFilename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext)
      ? cb(null, true)
      : cb(new Error("Format file tidak didukung"));
  },
});

export default upload;
