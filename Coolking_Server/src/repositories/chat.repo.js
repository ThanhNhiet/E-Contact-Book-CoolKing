const sequelize = require("../config/mariadb.conf");
const { Op } = require('sequelize');
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
        const groupChatDoc = await Chat.findOne({
            course_section_id,
            type: ChatType.GROUP
        });

        if (!groupChatDoc) {
            return {
                success: false,
                message: 'Nhóm chat không tồn tại cho course section này'
            };
        }

        // Chuyển thành plain object và format ngày giờ
        const groupChat = groupChatDoc.toObject();
        
        // Format createdAt, updatedAt, members[{..., joinedAt: ...}]
        groupChat.createdAt = datetimeFormatter.formatDateTimeVN(groupChat.createdAt);
        groupChat.updatedAt = datetimeFormatter.formatDateTimeVN(groupChat.updatedAt);
        groupChat.members = groupChat.members.map(member => ({
            ...member._doc || member, // Handle nested document
            joinedAt: datetimeFormatter.formatDateTimeVN(member.joinedAt)
        }));

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
 * Lấy danh sách các đoạn chat của một user với phân trang
 * @param {string} userID - ID của user
 * @param {string} roleAccount - Role của account ('STUDENT', 'PARENT', 'LECTURER', 'ADMIN')
 * @param {number} page - Trang hiện tại (mặc định 1)
 * @param {number} pageSize - Kích thước trang (mặc định 10)
 * @returns {Promise<Object>} - Danh sách các đoạn chat với phân trang
 */
const getUserChats = async (userID, roleAccount, page = 1, pageSize = 10) => {
    try {
        const page_num = Math.max(1, parseInt(page) || 1);
        const pageSize_num = Math.max(1, parseInt(pageSize) || 10);
        const skip = (page_num - 1) * pageSize_num;

        let chatFilter = {
            "members.userID": userID
        };

        // Phân loại chat theo role để tối ưu hóa truy vấn
        if (roleAccount === 'STUDENT') {
            // Student chỉ có group chat và private chat với lecturer
            chatFilter = {
                "members.userID": userID,
                $or: [
                    { type: ChatType.GROUP },
                    { type: ChatType.PRIVATE }
                ]
            };
        } else if (roleAccount === 'PARENT') {
            // Parent chỉ có private chat
            chatFilter = {
                "members.userID": userID,
                type: ChatType.PRIVATE
            };
        } else if (roleAccount === 'LECTURER') {
            chatFilter = {
                "members.userID": userID,
                $or: [
                    { type: ChatType.GROUP },
                    { type: ChatType.PRIVATE }
                ]
            };
        }

        // Đếm tổng số chat
        const total = await Chat.countDocuments(chatFilter);
        const totalPages = Math.ceil(total / pageSize_num);

        // Lấy dữ liệu với phân trang
        const chats = await Chat.find(chatFilter)
            .sort({ updatedAt: -1 }) // Sắp xếp theo thời gian cập nhật gần nhất
            .skip(skip)
            .limit(pageSize_num)
            .lean(); // Sử dụng lean() để tăng performance

        // Xử lý dữ liệu trả về
        const processedChats = chats.map(chat => {
            const result = {
                _id: chat._id,
                type: chat.type,
                name: chat.name,
                avatar: chat.avatar,
                course_section_id: chat.course_section_id,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt
            };

            // Nếu là private chat, tạo tên chat từ tên của người kia
            if (chat.type === ChatType.PRIVATE) {
                const otherMember = chat.members.find(member => member.userID !== userID);
                result.name = otherMember ? otherMember.userName : 'Unknown User';
                result.avatar = otherMember?.avatar || result.avatar;
            }

            // Thêm thông tin về member hiện tại
            const currentMember = chat.members.find(member => member.userID === userID);
            result.currentMember = currentMember || null;

            return result;
        });

        // Tạo pagination info
        const linkPrev = page_num > 1 ? page_num - 1 : null;
        const linkNext = page_num < totalPages ? page_num + 1 : null;
        
        // Tạo danh sách pages (hiển thị tối đa 5 trang xung quanh trang hiện tại)
        const pages = [];
        const startPage = Math.max(1, page_num - 2);
        const endPage = Math.min(totalPages, page_num + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return {
            total: total,
            page: page_num,
            pageSize: pageSize_num,
            totalPages,
            chats: processedChats,
            linkPrev,
            linkNext,
            pages
        };

    } catch (error) {
        console.error('Error getting user chats:', error);
        throw new Error(`Failed to get user chats: ${error.message}`);
    }
};

/**
 * Tìm kiếm chats theo từ khóa
 * @param {string} userID - ID của user hiện tại 
 * @param {string} keyword - Từ khóa tìm kiếm (name chat đối với group; phone, email đối với private)
 * @param {string} roleAccount - Role của user hiện tại để phân quyền tìm kiếm
 * @returns {Promise<Object>} - Danh sách chats với currentMember (không phân trang)
 */
const searchChatsByKeyword = async (userID, keyword, roleAccount) => {
    try {
        if (!keyword || keyword.trim() === '') {
            return {
                success: false,
                message: 'Từ khóa tìm kiếm không được để trống'
            };
        }

        const searchKeyword = keyword.trim();
        let chatFilter = { 'members.userID': userID };

        // Phân quyền tìm kiếm theo role
        let groupChatFilter = {};
        let privateChatFilter = {};

        if (roleAccount === 'STUDENT') {
            // Student có thể tìm group + private chats
            groupChatFilter = {
                'members.userID': userID,
                type: ChatType.GROUP,
                name: { $regex: searchKeyword, $options: 'i' }
            };
            privateChatFilter = {
                'members.userID': userID,
                type: ChatType.PRIVATE
            };
        } else if (roleAccount === 'PARENT') {
            // Parent chỉ có thể tìm private chats
            privateChatFilter = {
                'members.userID': userID,
                type: ChatType.PRIVATE
            };
        } else if (roleAccount === 'LECTURER' || roleAccount === 'ADMIN') {
            // Lecturer có thể tìm tất cả chats
            groupChatFilter = {
                'members.userID': userID,
                type: ChatType.GROUP,
                name: { $regex: searchKeyword, $options: 'i' }
            };
            privateChatFilter = {
                'members.userID': userID,
                type: ChatType.PRIVATE
            };
        }

        // Query group chats và private chats riêng biệt
        const [groupChats, allPrivateChats] = await Promise.all([
            Object.keys(groupChatFilter).length > 0 ? 
                Chat.find(groupChatFilter)
                    .populate('course_section_id', 'name code')
                    .sort({ lastMessageAt: -1 })
                    .limit(10)
                    .lean() : [],
            Object.keys(privateChatFilter).length > 0 ?
                Chat.find(privateChatFilter)
                    .sort({ lastMessageAt: -1 })
                    .lean() : []
        ]);

        // Filter private chats theo phone/email/name từ MariaDB
        const filteredPrivateChats = [];

        const searchCondition = {
            [Op.and]: [
                {
                    [Op.or]: [
                        { email: { [Op.like]: `%${searchKeyword}%` } },
                        { phone: { [Op.like]: `%${searchKeyword}%` } },
                        { name: { [Op.like]: `%${searchKeyword}%` } }
                    ]
                },
                { isDeleted: false }
            ]
        };

        for (const chat of allPrivateChats) {
            const otherMember = chat.members.find(member => member.userID !== userID);
            
            if (otherMember) {
                let userFound = false;

                // Tìm trong Student
                const student = await models.Student.findOne({
                    where: {
                        ...searchCondition,
                        student_id: otherMember.userID
                    }
                });

                if (student) userFound = true;

                // Tìm trong Lecturer nếu chưa tìm thấy
                if (!userFound) {
                    const lecturer = await models.Lecturer.findOne({
                        where: {
                            ...searchCondition,
                            lecturer_id: otherMember.userID
                        }
                    });
                    if (lecturer) userFound = true;
                }

                // Tìm trong Parent nếu chưa tìm thấy
                if (!userFound) {
                    const parent = await models.Parent.findOne({
                        where: {
                            ...searchCondition,
                            parent_id: otherMember.userID
                        }
                    });
                    if (parent) userFound = true;
                }

                // Chỉ thêm vào results nếu tìm thấy user matching
                if (userFound) {
                    filteredPrivateChats.push(chat);
                }
            }
        }

        // Kết hợp results và limit tổng cộng 20
        const allChats = [...groupChats, ...filteredPrivateChats]
            .sort((a, b) => new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt))
            .slice(0, 20);

        // Format response giống getUserChats
        const results = await Promise.all(allChats.map(async (chat) => {
            const currentMember = chat.members.find(member => member.userID === userID);
            
            let chatInfo = {
                _id: chat._id,
                chatType: chat.type,
                name: chat.name,
                avatar: chat.avatar,
                createdAt: chat.createdAt,
                currentMember: {
                    userID: currentMember.userID,
                    role: currentMember.role,
                    joinedAt: currentMember.joinedAt
                }
            };

            // Nếu là private chat, tên chat chính là tên của đối phương (đã có sẵn trong members.userName)
            if (chat.type === ChatType.PRIVATE) {
                const otherMember = chat.members.find(member => member.userID !== userID);
                if (otherMember) {
                    chatInfo.name = otherMember.userName;
                }
            }

            // Thêm thông tin course section cho group chat
            if (chat.type === ChatType.GROUP && chat.course_section_id) {
                chatInfo.courseSection = chat.course_section_id;
            }

            return chatInfo;
        }));

        return {
            success: true,
            chats: results
        };

    } catch (error) {
        console.error('Error searching users for chat:', error);
        throw new Error(`Failed to search users: ${error.message}`);
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

        // Lấy thông tin lecturers và kiểm tra tồn tại
        const lectureDetails = [];
        if (lecturers.length > 0) {
            const lecturerRecords = await models.Lecturer.findAll({
                where: { lecturer_id: lecturers },
                attributes: ['lecturer_id', 'name']
            });
            
            // Kiểm tra lecturers không tồn tại trong database
            const foundLecturerIds = lecturerRecords.map(l => l.lecturer_id);
            const notFoundLecturers = lecturers.filter(id => !foundLecturerIds.includes(id));
            if (notFoundLecturers.length > 0) {
                return {
                    success: false,
                    message: `Không tìm thấy giảng viên với ID: ${notFoundLecturers.join(', ')}`
                };
            }
            
            lectureDetails.push(...lecturerRecords);
        }

        // Lấy thông tin students và kiểm tra tồn tại
        const studentDetails = [];
        if (students.length > 0) {
            const studentRecords = await models.Student.findAll({
                where: { student_id: students },
                attributes: ['student_id', 'name']
            });
            
            // Kiểm tra students không tồn tại trong database
            const foundStudentIds = studentRecords.map(s => s.student_id);
            const notFoundStudents = students.filter(id => !foundStudentIds.includes(id));
            if (notFoundStudents.length > 0) {
                return {
                    success: false,
                    message: `Không tìm thấy sinh viên với ID: ${notFoundStudents.join(', ')}`
                };
            }
            
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

        // Tạo message chi tiết về kết quả
        let message = '';
        if (membersToAdd.length === 0) {
            message = 'Tất cả thành viên đã có trong nhóm chat';
        } else {
            const addedLecturers = membersToAdd.filter(m => m.role === MemberRole.ADMIN).length;
            const addedStudents = membersToAdd.filter(m => m.role === MemberRole.MEMBER).length;
            message = `Đã thêm ${membersToAdd.length} thành viên mới vào nhóm chat`;
            if (addedLecturers > 0 && addedStudents > 0) {
                message += ` (${addedLecturers} giảng viên, ${addedStudents} sinh viên)`;
            } else if (addedLecturers > 0) {
                message += ` (${addedLecturers} giảng viên)`;
            } else if (addedStudents > 0) {
                message += ` (${addedStudents} sinh viên)`;
            }
        }

        return {
            success: true,
            message: message
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

/**
 * Xoá private chat của các accounts có status INACTIVE
 * @returns {Promise<Object>} - Kết quả xóa
 */
const deleteInactivePrivateChats = async () => {
    try {
        // Lấy danh sách user_id của các account có status INACTIVE
        const inactiveAccounts = await models.Account.findAll({
            where: { status: 'INACTIVE' },
            attributes: ['user_id']
        });

        if (inactiveAccounts.length === 0) {
            return {
                success: true,
                message: 'Không có tài khoản INACTIVE nào để xóa chat'
            };
        }

        const inactiveUserIds = inactiveAccounts.map(account => account.user_id);

        // Xóa các private chat có chứa user INACTIVE (MongoDB operation)
        const deleteResult = await Chat.deleteMany({
            type: ChatType.PRIVATE,
            "members.userID": { $in: inactiveUserIds }
        });

        return {
            success: true,
            deletedCount: deleteResult.deletedCount,
            message: `Đã xóa ${deleteResult.deletedCount} private chat của các tài khoản không hoạt động`
        };

    } catch (error) {
        console.error('Error deleting inactive private chats:', error);
        throw new Error(`Failed to delete inactive private chats: ${error.message}`);
    }
};

/**
 * Lấy tất cả chats, phân trang, dành cho admin
 * @param {number} page - Trang hiện tại (mặc định 1)
 * @param {number} pageSize - Kích thước trang (mặc định 10)
 */
const getAllChats = async (page = 1, pageSize = 10) => {
    try {
        const page_num = Math.max(1, parseInt(page) || 1);
        const pageSize_num = Math.max(1, parseInt(pageSize) || 10);
        const skip = (page_num - 1) * pageSize_num;
        const total = await Chat.countDocuments({});
        const totalPages = Math.ceil(total / pageSize_num);
        const chats = await Chat.find({})
            .sort({ updatedAt: -1 }) // Sắp xếp theo thời gian cập nhật gần nhất
            .skip(skip)
            .limit(pageSize_num)
            .lean(); // Sử dụng lean() để tăng performance
        const processedChats = chats.map(chat => ({
            _id: chat._id,
            type: chat.type,
            name: chat.name,
            avatar: chat.avatar,
            course_section_id: chat.course_section_id,
            createdAt: chat?.createdAt ? datetimeFormatter.formatDateTimeVN(chat.createdAt) : null,
            updatedAt: chat?.updatedAt ? datetimeFormatter.formatDateTimeVN(chat.updatedAt) : null,
            memberCount: chat.members.length
        }));

        return {
            total,
            page: page_num,
            pageSize: pageSize_num,
            totalPages,
            chats: processedChats,
            linkPrev: page_num > 1 ? `/chats?page=${page_num - 1}&pageSize=${pageSize_num}` : null,
            linkNext: page_num < totalPages ? `/chats?page=${page_num + 1}&pageSize=${pageSize_num}` : null,
            pages: Array.from({ length: Math.min(3, totalPages - page_num + 1) }, (_, i) => page_num + i)
        };

    } catch (error) {
        console.error('Error getting all chats:', error);
        throw new Error(`Failed to get all chats: ${error.message}`);
    }
};

/** Tìm kiếm chats theo từ khóa, dành cho admin
 * @param {string} keyword - Từ khóa tìm kiếm (name chat đối với group; phone, email đối với private; course_section_id)
 * @param {number} page - Trang hiện tại (mặc định 1)
 * @param {number} pageSize - Kích thước trang (mặc định 10)
 * @returns {Promise<Object>} - Danh sách chats có phân trang
 */
const searchChatsByKeyword4Admin = async (keyword, page = 1, pageSize = 10) => {
    try {
        if (!keyword || keyword.trim() === '') {
           return await getAllChats(page, pageSize);
        }

        const searchKeyword = keyword.trim();
        const page_num = Math.max(1, parseInt(page) || 1);
        const pageSize_num = Math.max(1, parseInt(pageSize) || 10);
        const skip = (page_num - 1) * pageSize_num;

        // Kiểm tra xem keyword có phải là UUID (course_section_id) không
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(searchKeyword);

        let groupChats = [];
        
        if (isUUID) {
            // Nếu là UUID, tái sử dụng getGroupChatInfoByCourseSection4Admin
            try {
                const groupChatResult = await getGroupChatInfoByCourseSection4Admin(searchKeyword);
                if (groupChatResult.success && groupChatResult.data) {
                    groupChats = [groupChatResult.data];
                }
            } catch (error) {
                console.log('No group chat found for course_section_id:', searchKeyword);
            }
        } else {
            // Tìm group chats theo tên
            const groupChatFilter = {
                type: ChatType.GROUP,
                name: { $regex: searchKeyword, $options: 'i' }
            };
            groupChats = await Chat.find(groupChatFilter).sort({ updatedAt: -1 }).lean();
        }

        // Tìm private chats
        const privateChatFilter = {
            type: ChatType.PRIVATE
        };

        const allPrivateChats = await Chat.find(privateChatFilter).sort({ updatedAt: -1 }).lean();

        // Filter private chats theo phone/email/name từ MariaDB
        // Chỉ tìm private chat khi keyword KHÔNG phải là UUID (course_section_id)
        let filteredPrivateChats = [];

        if (!isUUID) {
            const searchCondition = {
                [Op.or]: [
                    { email: { [Op.like]: `%${searchKeyword}%` } },
                    { phone: { [Op.like]: `%${searchKeyword}%` } },
                    { name: { [Op.like]: `%${searchKeyword}%` } }
                ]
            };

            for (const chat of allPrivateChats) {
                let userFound = false;
                const allUserIDs = chat.members.map(member => member.userID);

                // Tìm trong Student
                const students = await models.Student.findAll({
                    where: {
                        ...searchCondition,
                        student_id: { [Op.in]: allUserIDs }
                    }
                });
                if (students.length > 0) userFound = true;

                // Tìm trong Lecturer nếu chưa tìm thấy
                if (!userFound) {
                    const lecturers = await models.Lecturer.findAll({
                        where: {
                            ...searchCondition,
                            lecturer_id: { [Op.in]: allUserIDs }
                        }
                    });
                    if (lecturers.length > 0) userFound = true;
                }

                // Tìm trong Parent nếu chưa tìm thấy
                if (!userFound) {
                    const parents = await models.Parent.findAll({
                        where: {
                            ...searchCondition,
                            parent_id: { [Op.in]: allUserIDs }
                        }
                    });
                    if (parents.length > 0) userFound = true;
                }

                if (userFound) {
                    filteredPrivateChats.push(chat);
                }
            }
        }

        // Kết hợp results và phân trang
        const allChats = [...groupChats, ...filteredPrivateChats]
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        const total = allChats.length;
        const totalPages = Math.ceil(total / pageSize_num);
        const paginatedChats = allChats.slice(skip, skip + pageSize_num);

        const processedChats = paginatedChats.map(chat => ({
            _id: chat._id,
            type: chat.type,
            name: chat.name,
            avatar: chat.avatar,
            course_section_id: chat.course_section_id,
            createdAt: chat?.createdAt ? datetimeFormatter.formatDateTimeVN(chat.createdAt) : null,
            updatedAt: chat?.updatedAt ? datetimeFormatter.formatDateTimeVN(chat.updatedAt) : null,
            memberCount: chat.members.length
        }));

        return {
            total,
            page: page_num,
            pageSize: pageSize_num,
            totalPages,
            chats: processedChats,
            linkPrev: page_num > 1 ? `/chats/search?keyword=${encodeURIComponent(keyword)}&page=${page_num - 1}&pageSize=${pageSize_num}` : null,
            linkNext: page_num < totalPages ? `/chats/search?keyword=${encodeURIComponent(keyword)}&page=${page_num + 1}&pageSize=${pageSize_num}` : null,
            pages: Array.from({ length: Math.min(3, totalPages - page_num + 1) }, (_, i) => page_num + i)
        };

    } catch (error) {
        console.error('Error searching chats for admin:', error);
        throw new Error(`Failed to search chats: ${error.message}`);
    }
};

/**
 * Lấy danh sách các lớp học phần chưa có group chat
 * @param {number} page - Trang hiện tại (mặc định 1) 
 * @param {number} pageSize - Kích thước trang (mặc định 10)
 * @returns {Promise<Object>} - Danh sách course sections chưa có group chat
 */
const getNonChatCourseSections = async (page = 1, pageSize = 10) => {
    try {
        const page_num = Math.max(1, parseInt(page) || 1);
        const pageSize_num = Math.max(1, parseInt(pageSize) || 10);
        const offset = (page_num - 1) * pageSize_num;

        // Lấy danh sách course_section_id đã có group chat
        const existingGroupChats = await Chat.find(
            { type: ChatType.GROUP, course_section_id: { $exists: true, $ne: null } },
            { course_section_id: 1 }
        ).lean();
        
        const existingCourseSectionIds = existingGroupChats.map(chat => chat.course_section_id);

        // Điều kiện WHERE để loại bỏ các course section đã có group chat
        const whereCondition = existingCourseSectionIds.length > 0 
            ? { id: { [Op.notIn]: existingCourseSectionIds } }
            : {};

        // Đếm tổng số course sections chưa có group chat
        const total = await models.CourseSection.count({
            where: whereCondition
        });

        // Lấy danh sách course sections chưa có group chat với phân trang
        const courseSections = await models.CourseSection.findAll({
            where: whereCondition,
            include: [
                {
                    model: models.Subject,
                    as: 'subject',
                    attributes: ['name'],
                    include: [
                        {
                            model: models.Faculty,
                            as: 'faculty',
                            attributes: ['name']
                        }
                    ]
                },
                {
                    model: models.Clazz,
                    as: 'clazz',
                    attributes: ['name']
                },
                {
                    model: models.Session,
                    as: 'session',
                    attributes: ['name', 'years']
                },
                {
                    model: models.LecturerCourseSection,
                    as: 'lecturers_course_sections',
                    include: [
                        {
                            model: models.Lecturer,
                            as: 'lecturer',
                            attributes: ['lecturer_id', 'name']
                        }
                    ]
                },
                {
                    model: models.Schedule,
                    as: 'schedules',
                    where: {
                        isExam: false
                    },
                    attributes: ['start_lesson', 'end_lesson'],
                    required: false
                }
            ],
            attributes: ['id', 'createdAt', 'updatedAt'],
            order: [['updatedAt', 'DESC']],
            limit: pageSize_num,
            offset: offset
        });

        // Format dữ liệu trả về
        const processedCourseSections = courseSections.map(cs => {
            const lecturer = cs.lecturers_course_sections?.[0]?.lecturer;
            const schedule = cs.schedules?.[0];
            
            return {
                subjectName: cs.subject?.name || 'N/A',
                className: cs.clazz?.name || 'N/A',
                course_section_id: cs.id,
                facultyName: cs.subject?.faculty?.name || 'N/A',
                sessionName: cs.session ? `${cs.session.name} ${cs.session.years}` : 'N/A',
                lecturerName: lecturer?.name || 'N/A',
                start_lesson: schedule?.start_lesson || 'N/A',
                end_lesson: schedule?.end_lesson || 'N/A',
                createdAt: datetimeFormatter.formatDateTimeVN(cs.createdAt),
                updatedAt: datetimeFormatter.formatDateTimeVN(cs.updatedAt)
            };
        });

        const totalPages = Math.ceil(total / pageSize_num);

        return {
            total,
            page: page_num,
            pageSize: pageSize_num,
            totalPages,
            courseSections: processedCourseSections,
            linkPrev: page_num > 1 ? `/course-sections/non-chat?page=${page_num - 1}&pageSize=${pageSize_num}` : null,
            linkNext: page_num < totalPages ? `/course-sections/non-chat?page=${page_num + 1}&pageSize=${pageSize_num}` : null,
            pages: Array.from({ length: Math.min(3, totalPages - page_num + 1) }, (_, i) => page_num + i)
        };

    } catch (error) {
        console.error('Error getting non-chat course sections:', error);
        throw new Error(`Failed to get non-chat course sections: ${error.message}`);
    }
};

/**
 * Tìm kiếm các lớp học phần chưa có group chat theo từ khóa
 * @param {string} keyword - Từ khóa tìm kiếm (subject name, class name, session name, course_section_id)
 * @param {number} page - Trang hiện tại (mặc định 1)
 * @param {number} pageSize - Kích thước trang (mặc định 10)
 * @returns {Promise<Object>} - Danh sách course sections chưa có group chat phù hợp
 */
const searchNonChatCourseSections = async (keyword, page = 1, pageSize = 10) => {
    try {
        if (!keyword || keyword.trim() === '') {
            return await getNonChatCourseSections(page, pageSize);
        }

        const searchKeyword = keyword.trim();
        const page_num = Math.max(1, parseInt(page) || 1);
        const pageSize_num = Math.max(1, parseInt(pageSize) || 10);
        const offset = (page_num - 1) * pageSize_num;

        // Lấy danh sách course_section_id đã có group chat
        const existingGroupChats = await Chat.find(
            { type: ChatType.GROUP, course_section_id: { $exists: true, $ne: null } },
            { course_section_id: 1 }
        ).lean();
        
        const existingCourseSectionIds = existingGroupChats.map(chat => chat.course_section_id);

        // Kiểm tra xem keyword có phải là UUID (course_section_id) không
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(searchKeyword);

        // Tìm kiếm theo từng tiêu chí riêng biệt và gộp kết quả
        let matchingCourseIds = new Set();

        if (isUUID) {
            // Nếu là UUID, tìm kiếm trực tiếp theo course_section_id
            if (!existingCourseSectionIds.includes(searchKeyword)) {
                // Kiểm tra course section có tồn tại không
                const courseSection = await models.CourseSection.findOne({
                    where: { id: searchKeyword },
                    attributes: ['id']
                });
                if (courseSection) {
                    matchingCourseIds.add(searchKeyword);
                }
            }
        } else {
            // Tìm kiếm theo các tiêu chí khác như trước
            
            // 1. Tìm theo subject name
        const subjectMatches = await models.CourseSection.findAll({
            include: [{
                model: models.Subject,
                as: 'subject',
                where: {
                    name: { [Op.like]: `%${searchKeyword}%` }
                },
                attributes: []
            }],
            attributes: ['id'],
            raw: true
        });
        subjectMatches.forEach(item => matchingCourseIds.add(item.id));

        // 2. Tìm theo class name (bắt đầu bằng DH)
        const classMatches = await models.CourseSection.findAll({
            include: [{
                model: models.Clazz,
                as: 'clazz',
                where: {
                    name: {
                        [Op.and]: [
                            { [Op.like]: 'DH%' },
                            { [Op.like]: `%${searchKeyword}%` }
                        ]
                    }
                },
                attributes: []
            }],
            attributes: ['id'],
            raw: true
        });
        classMatches.forEach(item => matchingCourseIds.add(item.id));

        // 3. Tìm theo session name (bắt đầu bằng HK)
        const sessionMatches = await models.CourseSection.findAll({
            include: [{
                model: models.Session,
                as: 'session',
                where: {
                    name: {
                        [Op.and]: [
                            { [Op.like]: 'HK%' },
                            { [Op.like]: `%${searchKeyword}%` }
                        ]
                    }
                },
                attributes: []
            }],
            attributes: ['id'],
            raw: true
        });
        sessionMatches.forEach(item => matchingCourseIds.add(item.id));
        }

        // Chuyển Set thành Array và loại bỏ các course section đã có group chat
        const filteredIds = Array.from(matchingCourseIds).filter(id => 
            !existingCourseSectionIds.includes(id)
        );

        if (filteredIds.length === 0) {
            return {
                total: 0,
                page: page_num,
                pageSize: pageSize_num,
                totalPages: 0,
                courseSections: [],
                linkPrev: null,
                linkNext: null,
                pages: []
            };
        }

        const whereCondition = {
            id: { [Op.in]: filteredIds }
        };

        // Đếm tổng số kết quả
        const total = filteredIds.length;

        // Lấy dữ liệu với phân trang
        const courseSections = await models.CourseSection.findAll({
            where: whereCondition,
            include: [
                {
                    model: models.Subject,
                    as: 'subject',
                    attributes: ['name'],
                    include: [
                        {
                            model: models.Faculty,
                            as: 'faculty',
                            attributes: ['name']
                        }
                    ]
                },
                {
                    model: models.Clazz,
                    as: 'clazz',
                    attributes: ['name']
                },
                {
                    model: models.Session,
                    as: 'session',
                    attributes: ['name', 'years']
                },
                {
                    model: models.LecturerCourseSection,
                    as: 'lecturers_course_sections',
                    include: [
                        {
                            model: models.Lecturer,
                            as: 'lecturer',
                            attributes: ['lecturer_id', 'name']
                        }
                    ]
                },
                {
                    model: models.Schedule,
                    as: 'schedules',
                    where: {
                        isExam: false
                    },
                    attributes: ['start_date', 'end_date'],
                    required: false
                }
            ],
            attributes: ['id', 'createdAt', 'updatedAt'],
            order: [['updatedAt', 'DESC']],
            limit: pageSize_num,
            offset: offset
        });

        // Format dữ liệu trả về
        const processedCourseSections = courseSections.map(cs => {
            const lecturer = cs.lecturers_course_sections?.[0]?.lecturer;
            const schedule = cs.schedules?.[0];
            
            return {
                subjectName: cs.subject?.name || 'N/A',
                className: cs.clazz?.name || 'N/A',
                course_section_id: cs.id,
                facultyName: cs.subject?.faculty?.name || 'N/A',
                sessionName: cs.session ? `${cs.session.name} ${cs.session.years}` : 'N/A',
                lecturerName: lecturer?.name || 'N/A',
                start_lesson: schedule?.start_date ? datetimeFormatter.formatDateVN(schedule.start_date) : 'N/A',
                end_lesson: schedule?.end_date ? datetimeFormatter.formatDateVN(schedule.end_date) : 'N/A',
                updatedAt: datetimeFormatter.formatDateTimeVN(cs.updatedAt)
            };
        });

        const totalPages = Math.ceil(total / pageSize_num);

        return {
            total,
            page: page_num,
            pageSize: pageSize_num,
            totalPages,
            courseSections: processedCourseSections,
            linkPrev: page_num > 1 ? `/course-sections/search?keyword=${encodeURIComponent(keyword)}&page=${page_num - 1}&pageSize=${pageSize_num}` : null,
            linkNext: page_num < totalPages ? `/course-sections/search?keyword=${encodeURIComponent(keyword)}&page=${page_num + 1}&pageSize=${pageSize_num}` : null,
            pages: Array.from({ length: Math.min(3, totalPages - page_num + 1) }, (_, i) => page_num + i)
        };

    } catch (error) {
        console.error('Error searching non-chat course sections:', error);
        throw new Error(`Failed to search non-chat course sections: ${error.message}`);
    }
};

module.exports = {
    createGroupChat4Admin,
    createPrivateChat4Users,
    getGroupChatInfoByCourseSection4Admin,
    getUserChats,
    searchChatsByKeyword,
    updateGroupChat4Admin,
    deleteGroupChat4Admin,
    deleteInactivePrivateChats,
    getAllChats,
    searchChatsByKeyword4Admin,
    getNonChatCourseSections,
    searchNonChatCourseSections
};
