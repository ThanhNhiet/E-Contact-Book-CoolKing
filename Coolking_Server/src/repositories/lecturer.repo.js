const sequelize = require("../config/mariadb.conf");
const { initModels } = require("../databases/mariadb/model/init-models");
const models = initModels(sequelize);
const datetimeFormatter = require("../utils/format/datetime-formatter");

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

module.exports = {
  getLecturerByLecturer_id,
  createLecturer,
  updateLecturer,
  deleteLecturer
};

