const sequelize = require("../config/mariadb.conf");
const initModels = require("../databases/mariadb/model/init-models");
const models = initModels(sequelize);
const datetimeFormatter = require("../utils/format/datetime-formatter");
const cloudinaryService = require("../services/cloudinary.service");
const cloudinaryUtils = require("../utils/cloudinary.utils");

const getParentByParent_id = async (parent_id) => {
  try {
    const result = await models.Parent.findOne({
      where: { parent_id, isDeleted: false },
       include: [
        {
          model: models.Student,
          as: "student",
          attributes: ["student_id", "name"],
          required: false,
        }
       ]

    });

    if (!result) throw new Error("Parent not found");
     const gender = result.gender === "1" ? "Nam" : "Nữ";
    return {
      parent_id: result.parent_id,
      name: result.name,
      email: result.email,
      dob : result.dob ? datetimeFormatter.formatDateVN(result.dob) : null,
      phone: result.phone,
      studentName: result.student ? result.student.name : null,
      student_id: result.student ? result.student.student_id : null,
      address: result.address,
      avatar: result.avatar,
      gender: gender,
      createdAt: result.createdAt ? datetimeFormatter.formatDateTimeVN(result.createdAt) : null,
      updatedAt: result.updatedAt ? datetimeFormatter.formatDateTimeVN(result.updatedAt) : null
    };
  } catch (error) {
    console.error("Error fetching parent:", error);
    throw error;
  }
};

const updateParentAvatar = async (parent_id, file) => {
    try {
        
        // Kiểm tra input
        if (!parent_id) {
            throw new Error("Parent ID is required");
        }
        if (!file || !file.buffer) {
            throw new Error("File is required");
        }

        const parent = await models.Parent.findOne({ where: { parent_id } });
        if (!parent) throw new Error("Parent not found");

        const folder = 'account_avatar';
          
        // Xóa avatar cũ nếu có
        if (parent.avatar) {
            try {
                const publicId = cloudinaryUtils.getPublicIdFromUrl(parent.avatar, folder);
                await cloudinaryService.deleteFromCloudinary(publicId);
            } catch (deleteError) {
                console.log('Warning: Could not delete old avatar:', deleteError.message);
            }
        }
        
        // Upload avatar mới
       const uploadResult = await cloudinaryService.upload2Cloudinary(file.buffer, folder, file.originalname);

        if (!uploadResult || !uploadResult.success) {
            throw new Error('Avatar upload failed');
        }
        
        // Cập nhật avatar URL trong database
        parent.avatar = uploadResult.url;
        await parent.save();

        return {
            parent_id: parent.parent_id,
            name: parent.name,
            avatar: parent.avatar,
            message: 'Avatar uploaded successfully'
        };
    } catch (error) {
        console.error("Error in updateParentAvatar:", error);
        throw error;
    }
};

module.exports = {
  getParentByParent_id,
  updateParentAvatar
};