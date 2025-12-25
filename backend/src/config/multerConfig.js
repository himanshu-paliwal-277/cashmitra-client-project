import multer from 'multer';
import path from 'path';

// Memory storage for file uploads
const storage = multer.memoryStorage();

// File filter for images only
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// File filter for specific image types (jpeg, jpg, png)
const strictImageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
};

// Default upload configuration (5MB limit, image files only)
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFileFilter,
});

// Upload configuration for agent routes (10MB limit, strict image types)
export const agentUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: strictImageFileFilter,
});

// File filter for documents (PDF, images)
const documentFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype =
    file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg, .jpeg, and .pdf formats are allowed!'));
  }
};

// Upload configuration for documents (10MB limit, PDF and images)
export const documentUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: documentFileFilter,
});

// Export storage and filters for custom configurations if needed
export { documentFileFilter, imageFileFilter, storage, strictImageFileFilter };
