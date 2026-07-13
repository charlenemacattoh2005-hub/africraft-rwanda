import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// ── Configure Cloudinary ──────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'nyd9fgxr',
  api_key:    process.env.CLOUDINARY_API_KEY    || '633921147819551',
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

// ── In-memory multer (no temp files, no extra package) ─────────
// Buffer is uploaded directly to Cloudinary in the route handler.
const memStorage = multer.memoryStorage();

function imageFilter(_req, file, cb) {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
}

export const uploadMiddleware = multer({
  storage:  memStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Upload a buffer to Cloudinary and return the secure URL.
 * @param {Buffer} buffer  — file buffer from multer
 * @param {string} [folder] — Cloudinary folder (default: "africraft")
 * @returns {Promise<string>} secure_url
 */
export async function uploadToCloudinary(buffer, folder = 'africraft') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export { cloudinary };
