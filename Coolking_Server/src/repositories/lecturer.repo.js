const sequelize = require("../config/mariadb.conf");
const { initModels } = require("../databases/mariadb/model/init-models");
const models = initModels(sequelize);
const datetimeFormatter = require("../utils/format/datetime-formatter");
const cloudinaryService = require("../services/cloudinary.service");
const cloudinaryUtils = require("../utils/cloudinary.utils");

const getLecturerByLecturer_id = async (lecturer_id) => {
  try {
    const result = await models.Lecturer.findOne({
      attributes: {
        exclude: ['id', 'isDeleted', 'faculty_id']
      },
      where: { lecturer_id, isDeleted: false },
      include: [
        {
          model: models.Faculty,
          as: 'faculty',
          attributes: ['name'],
          required: false
        },
        {
          model: models.Clazz,
          as: 'clazz',
          attributes: ['name'],
          required: false
        }
      ]
    });

    if (!result) throw new Error("Lecturer not found");

    const gender = result.gender == "1" ? "Nam" : "Nữ";

    return {
      lecturer_id: result.lecturer_id,
      name: result.name,
      dob: datetimeFormatter.formatDateVN(result.dob),
      gender,
      avatar: result.avatar,
      phone: result.phone,
      email: result.email,
      address: result.address,
      facultyName: result.faculty ? result.faculty.name : null,
      homeroomClassName: result.clazz ? result.clazz.name : null,
      createdAt: datetimeFormatter.formatDateTimeVN(result.createdAt),
      updatedAt: datetimeFormatter.formatDateTimeVN(result.updatedAt),
    };
  } catch (error) {
    throw error;
  }
};

const createLecturer = async (lecturerData) => {
  try {
    lecturerData.dob = datetimeFormatter.convertddMMyyyy2yyyyMMdd(lecturerData.dob);
    return await models.Account.create(lecturerData);
  } catch (error) {
    throw error;
  }
};

const updateLecturer = async (lecturer_id, lecturerData) => {
  try {
    const lecturer = await models.Lecturer.findOne({ where: { lecturer_id } });
    if (!lecturer) throw new Error("Leturer not found");
    lecturerData.dob = datetimeFormatter.convertddMMyyyy2yyyyMMdd(lecturerData.dob);
    return await lecturer.update(lecturerData);
  } catch (error) {
    throw error;
  }
};

const deleteLecturer = async (lecturer_id) => {
  try {
    const lecturer = await models.Lecturer.findOne({ where: { lecturer_id } });
    if (!lecturer) throw new Error("Leturer not found");
    lecturer.isDeleted = true;
    await lecturer.save();
    return lecturer;
  } catch (error) {
    throw error;
  }
};

const uploadAvatar = async (lecturer_id, file) => {
  try {
    const lecturer = await models.Lecturer.findOne({ where: { lecturer_id } });
    if (!lecturer) throw new Error("Lecturer not found");
    const folder = 'account_avatar';
  
    // Xóa avatar cũ nếu có
    if (lecturer.avatar) {
      try {
        const publicId = cloudinaryUtils.getPublicIdFromUrl(lecturer.avatar, folder);
        await cloudinaryService.deleteFromCloudinary(publicId);
      } catch (deleteError) {
        console.log('Warning: Could not delete old avatar:', deleteError.message);
      }
    }
    
    // Upload avatar mới
    const uploadResult = await cloudinaryService.upload2Cloudinary(file.buffer, folder, file.originalname);
    if (!uploadResult.success) {
      throw new Error('Avatar upload failed');
    }
    
    // Cập nhật avatar URL trong database
    lecturer.avatar = uploadResult.url;
    await lecturer.save();
    
    return {
      lecturer_id: lecturer.lecturer_id,
      name: lecturer.name,
      avatar: lecturer.avatar,
      message: 'Avatar uploaded successfully'
    };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw new Error(`Avatar upload failed: ${error.message}`);
  }
};

const getLecturerById = async (lecturer_id) => {
  try {
    const lecturer = await models.Lecturer.findOne({ where: { lecturer_id } });
    if (!lecturer) throw new Error("Lecturer not found");
    return lecturer;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getLecturerByLecturer_id,
  createLecturer,
  updateLecturer,
  deleteLecturer,
  uploadAvatar,
  getLecturerById
};

