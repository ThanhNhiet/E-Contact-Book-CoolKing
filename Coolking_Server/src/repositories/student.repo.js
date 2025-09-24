
const sequelize = require("../config/mariadb.conf");
const { initModels } = require("../databases/mariadb/model/init-models");
const models = initModels(sequelize);
const datetimeFormatter = require("../utils/format/datetime-formatter");

const getStudentByStudent_id = async (student_id) => {
    try {
        const result = await models.Student.findOne({
            attributes: {
                exclude: ['id', 'isDeleted']
            },
            where: { student_id, isDeleted: false },
            include: [
                {
                    model: models.Clazz,
                    as: 'clazz',
                    attributes: ['name','id'],
                    required: false
                },
                {
                    model: models.Major,
                    as: 'major', 
                    attributes: ['name', 'major_id'],
                    required: false
                }
            ]
        });
        if (!result) throw new Error("Student not found");

        const gender = result.gender === "1" ? "Nam" : "Nữ";
        return{
            student_id: result.student_id,
            name: result.name,
            dob: datetimeFormatter.formatDateVN(result.dob),
            gender,
            avatar: result.avatar,
            phone: result.phone,
            email: result.email,
            address: result.address,
            clazzName: result.clazz ? result.clazz.name : null,
            clazzId: result.clazz ? result.clazz.id : null,
            majorName: result.major ? result.major.name : null,
            majorId: result.major ? result.major.major_id : null,
            createdAt: datetimeFormatter.formatDateTimeVN(result.createdAt),
            updatedAt: datetimeFormatter.formatDateTimeVN(result.updatedAt),
        }
        
    } catch (error) {
        console.error("Error in getStudentByStudent_id:", error);
        throw error;
    }
}

const updateStudentInfo = async (student_id, updateData) => {
    try {
        const student = await models.Student.findOne({ where: { student_id } });
        if (!student) throw new Error("Student not found");
        updateData.dob = datetimeFormatter.convertddMMyyyy2yyyyMMdd(updateData.dob);
        updateData.updatedAt = new Date();
        return await student.update(updateData);
    } catch (error) {
        console.error("Error in updateStudentInfo:", error);
        throw error;
    }
}



module.exports = {
    getStudentByStudent_id,
    updateStudentInfo
};