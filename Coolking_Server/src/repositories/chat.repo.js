const sequelize = require("../config/mariadb.conf");
const initModels = require("../databases/mariadb/model/init-models");
const models = initModels(sequelize);

const { v4: uuidv4 } = require('uuid');
const { Chat, ChatType, MemberRole } = require('../databases/mongodb/schemas/Chat');
const mongoose = require('mongoose');
const datetimeFormatter = require("../utils/format/datetime-formatter");

/**
 * Tạo group chat cho admin (course section)
 * @param {string} admin_id - ID của admin
 * @param {string} nameGroup - Tên nhóm chat
 * @param {string} course_section_id - ID của course section
 * @returns {Promise<Object>} - Chat được tạo
 */
const createGroupChat4Admin = async (admin_id, nameGroup, course_section_id) => {
    try {
        // Lấy danh sách lecturers của course section
        const lecturerCourseSections = await models.LecturerCourseSection.findAll({
            where: { course_section_id },
            include: [{
                model: models.Lecturer,
                as: 'lecturer',
                attributes: ['lecturer_id', 'name']
            }]
        });

        // Lấy danh sách students của course section
        const studentCourseSections = await models.StudentCourseSection.findAll({
            where: { course_section_id },
            include: [{
                model: models.Student,
                as: 'student',
                attributes: ['student_id', 'name']
            }]
        });

        // Tạo members array
        const members = [];
        const now = new Date();

        // Thêm lecturers với role admin
        lecturerCourseSections.forEach(lcs => {
            if (lcs.lecturer) {
                members.push({
                    userID: lcs.lecturer.lecturer_id,
                    userName: lcs.lecturer.name,
                    role: MemberRole.ADMIN,
                    joinedAt: now,
                    muted: false
                });
            }
        });

        // Thêm students với role member
        studentCourseSections.forEach(scs => {
            if (scs.student) {
                members.push({
                    userID: scs.student.student_id,
                    userName: scs.student.name,
                    role: MemberRole.MEMBER,
                    joinedAt: now,
                    muted: false
                });
            }
        });

        // Tạo chat object
        const chatData = {
            _id: uuidv4(),
            course_section_id,
            type: ChatType.GROUP,
            name: nameGroup,
            avatar: "https://res.cloudinary.com/dplg9r6z1/image/upload/v1758809477/groupavatar_driiwd.png",
            createdBy: admin_id,
            updatedBy: admin_id,
            members
        };

        // Lưu vào MongoDB
        const newChat = new Chat(chatData);
        await newChat.save();

        return {
            success: true,
            message: 'Nhóm chat được tạo thành công'
        };

    } catch (error) {
        console.error('Error creating group chat:', error);
        throw new Error(`Failed to create group chat: ${error.message}`);
    }
};

/**
 * Tạo private chat giữa 2 users
 * @param {string} requestUserID - ID của user tạo chat
 * @param {string} targetUserID - ID của user được chat
 * @returns {Promise<Object>} - Chat được tạo
 */
const createPrivateChat4Users = async (requestUserID, targetUserID) => {
    try {
        // Kiểm tra xem private chat đã tồn tại chưa
        const existingChat = await Chat.findOne({
            type: ChatType.PRIVATE,
            $and: [
                { "members.userID": requestUserID },
                { "members.userID": targetUserID }
            ]
        });

        if (existingChat) {
            return {
                success: true,
                data: existingChat,
                message: 'Cuộc trò chuyện đã tồn tại'
            };
        }

        // Lấy thông tin của request user
        let requestUser = null;
        requestUser = await models.Lecturer.findOne({
            where: { lecturer_id: requestUserID },
            attributes: ['lecturer_id', 'name']
        });

        if (!requestUser) {
            requestUser = await models.Student.findOne({
                where: { student_id: requestUserID },
                attributes: ['student_id', 'name']
            });
        }

        if (!requestUser) {
            requestUser = await models.Parent.findOne({
                where: { parent_id: requestUserID },
                attributes: ['parent_id', 'name']
            });
        }

        // Lấy thông tin của target user
        let targetUser = null;
        targetUser = await models.Lecturer.findOne({
            where: { lecturer_id: targetUserID },
            attributes: ['lecturer_id', 'name']
        });

        if (!targetUser) {
            targetUser = await models.Student.findOne({
                where: { student_id: targetUserID },
                attributes: ['student_id', 'name']
            });
        }

        if (!targetUser) {
            targetUser = await models.Parent.findOne({
                where: { parent_id: targetUserID },
                attributes: ['parent_id', 'name']
            });
        }

        if (!requestUser || !targetUser) {
            throw new Error('One or both users not found');
        }

        // Tạo members array
        const now = new Date();
        const members = [
            {
                userID: requestUserID,
                userName: requestUser.name,
                joinedAt: now,
                muted: false
            },
            {
                userID: targetUserID,
                userName: targetUser.name,
                joinedAt: now,
                muted: false
            }
        ];

        // Tạo chat object
        const chatData = {
            _id: uuidv4(),
            type: ChatType.PRIVATE,
            avatar: "https://res.cloudinary.com/dplg9r6z1/image/upload/v1758809711/privateavatar_hagxki.png",
            createdBy: requestUserID,
            updatedBy: requestUserID,
            members
        };

        // Lưu vào MongoDB
        const newChat = new Chat(chatData);
        await newChat.save();

        return {
            success: true,
            message: 'Cuộc trò chuyện được tạo thành công'
        };

    } catch (error) {
        console.error('Error creating private chat:', error);
        throw new Error(`Failed to create private chat: ${error.message}`);
    }
};

/**
 * Lấy thông tin group chat theo course section
 * @param {string} course_section_id - ID của course section
 * @returns {Promise<Object>} - Thông tin group chat
 */
const getGroupChatInfoByCourseSection4Admin = async (course_section_id) => {
    try {
        const groupChat = await Chat.findOne({
            course_section_id,
            type: ChatType.GROUP
        });

        if (!groupChat) {
            return {
                success: false,
                message: 'Nhóm chat không tồn tại cho course section này'
            };
        }

        return {
            success: true,
            message: 'Tìm thấy nhóm chat',
            data: groupChat
        };

    } catch (error) {
        console.error('Error getting group chat info:', error);
        throw new Error(`Failed to get group chat info: ${error.message}`);
    }
};

/**
 * Cập nhật group chat cho admin
 * @param {string} admin_id - ID của admin
 * @param {string} chatID - ID của chat
 * @param {Object} data - Dữ liệu cập nhật {students: [], lecturers: []}
 * @returns {Promise<Object>} - Chat đã được cập nhật
 */
const updateGroupChat4Admin = async (admin_id, chatID, data) => {
    try {
        const { name = '', students = [], lecturers = [] } = data;

        // Kiểm tra chat có tồn tại và user có quyền admin không
        const chat = await Chat.findOne({
            _id: chatID,
            type: ChatType.GROUP
        });

        if (!chat) {
            throw new Error('Chat not found');
        }

        // Lấy thông tin lecturers
        const lectureDetails = [];
        if (lecturers.length > 0) {
            const lecturerRecords = await models.Lecturer.findAll({
                where: { lecturer_id: lecturers },
                attributes: ['lecturer_id', 'name']
            });
            lectureDetails.push(...lecturerRecords);
        }

        // Lấy thông tin students
        const studentDetails = [];
        if (students.length > 0) {
            const studentRecords = await models.Student.findAll({
                where: { student_id: students },
                attributes: ['student_id', 'name']
            });
            studentDetails.push(...studentRecords);
        }

        // Lấy danh sách members hiện tại
        const currentMembers = chat.members || [];
        const existingUserIDs = currentMembers.map(member => member.userID);
        
        // Tạo members mới để thêm vào
        const now = new Date();
        const membersToAdd = [];

        // Thêm lecturers với role admin (chỉ thêm nếu chưa có)
        lectureDetails.forEach(lecturer => {
            if (!existingUserIDs.includes(lecturer.lecturer_id)) {
                membersToAdd.push({
                    userID: lecturer.lecturer_id,
                    userName: lecturer.name,
                    role: MemberRole.ADMIN,
                    joinedAt: now,
                    muted: false
                });
            }
        });

        // Thêm students với role member (chỉ thêm nếu chưa có)
        studentDetails.forEach(student => {
            if (!existingUserIDs.includes(student.student_id)) {
                membersToAdd.push({
                    userID: student.student_id,
                    userName: student.name,
                    role: MemberRole.MEMBER,
                    joinedAt: now,
                    muted: false
                });
            }
        });

        // Kết hợp members cũ + members mới
        const allMembers = [...currentMembers, ...membersToAdd];

        // Cập nhật chat
        let updatedChat;
        if (name && name.trim() !== '') {
            updatedChat = await Chat.findByIdAndUpdate(
                chatID,
                {
                    name: name.trim(),
                    members: allMembers,
                    updatedBy: admin_id
                },
                { new: true }
            );
        } else {
            updatedChat = await Chat.findByIdAndUpdate(
                chatID,
                {
                    members: allMembers,
                    updatedBy: admin_id
                },
                { new: true }
            );
        }

        return {
            success: true,
            message: `Đã thêm ${membersToAdd.length} thành viên mới vào nhóm chat`
        };

    } catch (error) {
        console.error('Error updating group chat:', error);
        throw new Error(`Failed to update group chat: ${error.message}`);
    }
};

/**
 * Xóa group chat cho admin
 * @param {string} chatID - ID của chat
 * @returns {Promise<Object>} - Kết quả xóa
 */
const deleteGroupChat4Admin = async (chatID) => {
    try {
        const deletedChat = await Chat.findByIdAndDelete(chatID);

        if (!deletedChat) {
            throw new Error('Chat not found');
        }

        return {
            success: true,
            message: 'Xóa nhóm chat thành công'
        };

    } catch (error) {
        console.error('Error deleting group chat:', error);
        throw new Error(`Failed to delete group chat: ${error.message}`);
    }
};

module.exports = {
    createGroupChat4Admin,
    createPrivateChat4Users,
    getGroupChatInfoByCourseSection4Admin,
    updateGroupChat4Admin,
    deleteGroupChat4Admin
};
