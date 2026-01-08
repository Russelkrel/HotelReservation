import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

interface UploadOptions {
  folder: string;
  publicId?: string;
  resource_type?: string;
}

export const uploadToCloudinary = (
  file: Express.Multer.File,
  options: UploadOptions
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder: options.folder,
      public_id: options.publicId,
    };
    
    if (options.resource_type) {
      uploadOptions.resource_type = options.resource_type;
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    // Convert buffer to stream and pipe to cloudinary
    Readable.from(file.buffer).pipe(stream);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};
