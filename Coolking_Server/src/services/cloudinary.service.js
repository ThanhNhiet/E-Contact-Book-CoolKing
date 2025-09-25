const cloudinary = require('../config/cloudinary.conf');

/**
 * Tạo tên file theo format ddMMyyyyhhmmss
 */
const generateFileName = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${day}${month}${year}${hours}${minutes}${seconds}`;
};

/**
 * Upload file từ buffer lên Cloudinary
 * @param {Buffer} fileBuffer - Buffer của file
 * @param {string} folder - Thư mục trên Cloudinary: 'account_avatar', 'message_file', 'message_img'
 * @param {string} originalName - Tên file gốc (để lấy extension)
 * @returns {Promise<Object>} - Kết quả upload
 */
const upload2Cloudinary = async (fileBuffer, folder, originalName = '') => {
    try {
        // Lấy extension từ tên file gốc
        const extension = originalName ? originalName.split('.').pop() : '';
        const originalNameWithoutExt = originalName ? originalName.slice(0, originalName.lastIndexOf('.')) : '';
        const fileName = generateFileName();
        const publicId = extension ? `${originalNameWithoutExt}_${fileName}` : `${originalNameWithoutExt}_${fileName}`;

        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    public_id: publicId,
                    resource_type: 'auto',
                    quality: 'auto:good'
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(new Error(`Upload failed: ${error.message}`));
                    } else {
                        resolve({
                            success: true,
                            url: result.secure_url,
                            public_id: result.public_id,
                            width: result.width,
                            height: result.height,
                            format: result.format,
                            bytes: result.bytes,
                            created_at: result.created_at
                        });
                    }
                }
            ).end(fileBuffer);
        });
    } catch (error) {
        console.error('Upload service error:', error);
        throw new Error(`Upload service failed: ${error.message}`);
    }
};

/**
 * Xóa file từ Cloudinary
 * @param {string} publicId - Public ID của file
 * @param {string} resourceType - Loại resource ('image', 'video', 'raw', 'auto')
 * @returns {Promise<Object>} - Kết quả xóa
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });

        return {
            success: result.result === 'ok',
            result: result.result,
            public_id: publicId
        };
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
    }
};

/**
 * Lấy thông tin file từ Cloudinary
 * @param {string} publicId - Public ID của file
 * @returns {Promise<Object>} - Thông tin file
 */
const getFileInfo = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId);
        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error('Get file info error:', error);
        throw new Error(`Get file info failed: ${error.message}`);
    }
};

module.exports = {
    upload2Cloudinary,
    deleteFromCloudinary,
    getFileInfo,
    generateFileName
};
