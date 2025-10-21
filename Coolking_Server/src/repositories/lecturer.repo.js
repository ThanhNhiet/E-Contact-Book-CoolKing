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
  const transaction = await sequelize.transaction();
  
  try {
    // Tìm lecturer
    const lecturer = await models.Lecturer.findOne({ 
      where: { lecturer_id },
      transaction 
    });
    if (!lecturer) throw new Error("Lecturer not found");

    // Tìm account tương ứng
    const account = await models.Account.findOne({ 
      where: { user_id: lecturer_id },
      transaction 
    });
    if (!account) throw new Error("Account not found");

    // Chuẩn bị dữ liệu cho lecturer
    const lecturerUpdateData = { ...lecturerData };
    if (lecturerUpdateData.dob) {
      lecturerUpdateData.dob = datetimeFormatter.convertddMMyyyy2yyyyMMdd(lecturerUpdateData.dob);
    }

    // Chuẩn bị dữ liệu cho account
    const accountUpdateData = {};
    if (lecturerData.email) {
      accountUpdateData.email = lecturerData.email;
    }
    if (lecturerData.phone) {
      accountUpdateData.phone_number = lecturerData.phone;
    }

    // Cập nhật lecturer
    await lecturer.update(lecturerUpdateData, { transaction });

    // Cập nhật account nếu có dữ liệu email hoặc phone
    if (Object.keys(accountUpdateData).length > 0) {
      await account.update(accountUpdateData, { transaction });
    }

    // Cập nhật thông tin trong MongoDB Chat nếu có thay đổi email hoặc phone
    if (lecturerData.email || lecturerData.phone) {
      try {
        const { Chat } = require('../databases/mongodb/schemas/Chat');
        
        const updateFields = {};
        if (lecturerData.email) {
          updateFields["members.$.email"] = lecturerData.email;
        }
        if (lecturerData.phone) {
          updateFields["members.$.phone"] = lecturerData.phone;
        }
        
        if (Object.keys(updateFields).length > 0) {
          updateFields.updatedAt = new Date();
          
          await Chat.updateMany(
            { "members.userID": lecturer_id },
            { $set: updateFields }
          );
        }
      } catch (chatUpdateError) {
        console.warn('Warning: Could not update lecturer info in chats:', chatUpdateError.message);
        // Không throw error vì cập nhật chính đã thành công
      }
    }

    await transaction.commit();
    
    return {
      lecturer: await lecturer.reload(),
      account: await account.reload(),
      message: 'Lecturer updated successfully'
    };
  } catch (error) {
    await transaction.rollback();
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
    
    // Cập nhật avatar trong tất cả các chat có chứa lecturer này
    try {
      const { Chat } = require('../databases/mongodb/schemas/Chat');
      
      // Tìm tất cả chat có members chứa userID = lecturer_id
      const updateResult = await Chat.updateMany(
        { "members.userID": lecturer_id },
        { 
          $set: { 
            "members.$.avatar": uploadResult.url,
            updatedAt: new Date()
          } 
        }
      );
      
    } catch (chatUpdateError) {
      console.warn('Warning: Could not update avatar in chats:', chatUpdateError.message);
      // Không throw error vì avatar đã được cập nhật thành công trong MariaDB
    }
    
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

const getLecturerById4Admin = async (lecturer_id) => {
  try {
    const lecturer = await models.Lecturer.findOne({ where: { lecturer_id } });
    if (!lecturer) throw new Error("Lecturer not found");
    const homeroom = await models.Clazz.findOne({ where: { id: lecturer.homeroom_class_id } });
    return {
      lecturer_id: lecturer.lecturer_id,
      name: lecturer.name,
      phone: lecturer.phone,
      email: lecturer.email,
      faculty_id: lecturer.faculty_id,
      homeroom_name: homeroom ? homeroom.name : null
    };
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
  getLecturerById4Admin
};

