const sequelize = require("../config/mariadb.conf");
const initModels = require("../databases/mariadb/model/init-models");
const models = initModels(sequelize);

const { v4: uuidv4 } = require('uuid');
const { Message,MessageStatus,MessageType } = require('../databases/mongodb/schemas/Message');
const mongoose = require('mongoose');
const datetimeFormatter = require("../utils/format/datetime-formatter");
const cloudinaryService = require('../services/cloudinary.service');

const folder = 'messages'; // Cloudinary folder for messages



const createMessageText = async ({ chatID, senderID, content }) => {
    try {
        if (!content || content.trim() === '') {
            throw new Error('Content cannot be empty');
            return;
        }
        
        // Generate unique messageID using timestamp and random string
        const countMessages = await Message.countDocuments();
        let messageID = '';
        if (countMessages === 0) {
            messageID = 'MSG00001';
        } else {
            const lastMessage = await Message.findOne().sort({ createdAt: -1 });
            const lastMessageID = lastMessage.messageID;
            const newMessageID = parseInt(lastMessageID.replace('MSG', '')) + 1;
            messageID = 'MSG' + String(newMessageID).padStart(5, '0');
        }
        
        const newMessage = new Message({
            _id: uuidv4(),
            messageID,
            chatID,
            senderID,
            content,
            type: MessageType.TEXT,
            status: MessageStatus.SENDING,
            filename: null,
            replyTo: null,
            pinnedInfo: null,
        });
        await newMessage.save();

         const lastMessage = await Message.findOne({ chatID }).sort({ createdAt: -1 });

        if (!lastMessage) {
            throw new Error("No messages found for the given chatID");
            return;
        }
    
        return {
            _id: lastMessage._id,
            messageID: lastMessage.messageID,
            chatID: lastMessage.chatID,
            senderID: lastMessage.senderID,
            content: lastMessage.content,
            type: lastMessage.type,
            status: lastMessage.status,
            filename: lastMessage.filename,
            replyTo: lastMessage.replyTo,
            pinnedInfo: lastMessage.pinnedInfo,
            createdAt: datetimeFormatter.formatDateVN(lastMessage.createdAt),
            updatedAt: datetimeFormatter.formatDateVN(lastMessage.updatedAt)
        };

    } catch (error) {
        console.error("Error creating text message:", error);
        throw error;
    }
}

const createMessageFile = async ({ chatID, senderID, files }) => {
    try {
        if (!files || files.length === 0) {
            throw new Error('No files provided');
            return;
        }
        const filename = files.map(file => file.originalname).join(', ');
        const uploadPromises = files.map(file => {
            return cloudinaryService.upload2Cloudinary(file.buffer, folder, file.originalname);
        });

        const uploadResults = await Promise.all(uploadPromises);
        const failedUploads = uploadResults.every(result => result && result.url);

        if (!failedUploads) {
            throw new Error('File upload failed');
        }
        const links = uploadResults.map(result => result.url);
        
        // Generate unique messageID
        const countMessages = await Message.countDocuments();
        let messageID = '';
        if (countMessages === 0) {
            messageID = 'MSG00001';
        } else {
            const lastMessage = await Message.findOne().sort({ createdAt: -1 });
            const lastMessageID = lastMessage.messageID;
            const newMessageID = parseInt(lastMessageID.replace('MSG', '')) + 1;
            messageID = 'MSG' + String(newMessageID).padStart(5, '0');
        }
        
        const newMessage = new Message({
            _id: uuidv4(),
            messageID,
            chatID,
            senderID,
            content: links.join(','), // Join multiple links with a comma
            type: MessageType.FILE, 
            status: MessageStatus.SENDING,
            filename,
            replyTo: null,
            pinnedInfo: null,
        });
        await newMessage.save();

        const lastMessage = await Message.findOne({ chatID }).sort({ createdAt: -1 });

        if (!lastMessage) {
            throw new Error("No messages found for the given chatID");
            return;
        }
        return {
            _id: lastMessage._id,
            messageID: lastMessage.messageID,
            chatID: lastMessage.chatID,
            senderID: lastMessage.senderID,
            content: lastMessage.content,
            type: lastMessage.type,
            status: lastMessage.status,
            filename: lastMessage.filename,
            replyTo: lastMessage.replyTo,
            pinnedInfo: lastMessage.pinnedInfo,
            createdAt: datetimeFormatter.formatDateVN(lastMessage.createdAt),
            updatedAt: datetimeFormatter.formatDateVN(lastMessage.updatedAt)
        };

    } catch (error) {
        console.error("Error creating file message:", error);
        throw error;
    }
}

const createMessageImage = async ({ chatID, senderID, images }) => {
    try {
        if (!images || images.length === 0) {
            throw new Error('No images provided');
            return;
        }
        const uploadPromises = images.map(image => {
            return cloudinaryService.upload2Cloudinary(image.buffer, folder, image.originalname);
        });

        const uploadResults = await Promise.all(uploadPromises);
        const failedUploads = uploadResults.every(result => result && result.url);

        if (!failedUploads) {
            throw new Error('Image upload failed');
        }

        const links = uploadResults.map(result => result.url);
        const countMessages = await Message.countDocuments();
        let messageID = '';
        if (countMessages === 0) {
            messageID = 'MSG00001';
        } else {
            const lastMessage = await Message.findOne().sort({ createdAt: -1 });
            const lastMessageID = lastMessage.messageID;
            const newMessageID = parseInt(lastMessageID.replace('MSG', '')) + 1;
            messageID = 'MSG' + String(newMessageID).padStart(5, '0');
        }
        const newMessage = new Message({
            _id: uuidv4(),
            messageID,
            chatID,
            senderID,
            content: links.join(','), // Join multiple links with a comma
            type: MessageType.IMAGE,
            status: MessageStatus.SENDING,
            filename: null,
            replyTo: null,
            pinnedInfo: null,
        });
        await newMessage.save();

        const lastMessage = await Message.findOne({ chatID }).sort({ createdAt: -1 });

        if (!lastMessage) {
            throw new Error("No messages found for the given chatID");
            return;
        }
        
        return {
            _id: lastMessage._id,
            messageID: lastMessage.messageID,
            chatID: lastMessage.chatID,
            senderID: lastMessage.senderID,
            content: lastMessage.content,
            type: lastMessage.type,
            status: lastMessage.status,
            filename: lastMessage.filename,
            replyTo: lastMessage.replyTo,
            pinnedInfo: lastMessage.pinnedInfo,
            createdAt: datetimeFormatter.formatDateVN(lastMessage.createdAt),
            updatedAt: datetimeFormatter.formatDateVN(lastMessage.updatedAt)
        };

    } catch (error) {
        console.error("Error creating image message:", error);
        throw error;
    }
}

const createMessageTextReply = async ({ chatID, senderID, content, replyTo }) => {
    try {
        const countMessages = await Message.countDocuments();
        let messageID = '';
        if (countMessages === 0) {
            messageID = 'MSG00001';
        } else {
            const lastMessage = await Message.findOne().sort({ createdAt: -1 });
            const lastMessageID = lastMessage.messageID;
            const newMessageID = parseInt(lastMessageID.replace('MSG', '')) + 1;
            messageID = 'MSG' + String(newMessageID).padStart(5, '0');
        }
        if (!content || content.trim() === '') {
            throw new Error('Content cannot be empty');
            return;
        }
        const newMessage = new Message({
            _id: uuidv4(),
            messageID,  
            chatID,
            senderID,
            content,
            type: MessageType.TEXT,
            status: MessageStatus.SENDING,
            filename: null,
            replyTo,
            pinnedInfo: null,
        });
        await newMessage.save();

        const lastMessage = await Message.findOne({ chatID }).sort({ createdAt: -1 });
        if (!lastMessage) {
            throw new Error("No messages found for the given chatID");
            return;
        }
        return {
            _id: lastMessage._id,
            messageID: lastMessage.messageID,
            chatID: lastMessage.chatID,
            senderID: lastMessage.senderID,
            content: lastMessage.content,
            type: lastMessage.type,
            status: lastMessage.status,
            filename: lastMessage.filename,
            replyTo: lastMessage.replyTo,
            pinnedInfo: lastMessage.pinnedInfo,
            createdAt: datetimeFormatter.formatDateVN(lastMessage.createdAt),
            updatedAt: datetimeFormatter.formatDateVN(lastMessage.updatedAt)
        };
    } catch (error) {
        console.error("Error creating reply message:", error);
        throw error;
    }
}

const createMessageFileReply = async ({ chatID, senderID, replyTo, files }) => {
    try {
        if (!files || files.length === 0) {
            throw new Error('No files provided');
            return;
        }
        const filename = files.map(file => file.originalname).join(', ');
        const uploadPromises = files.map(file => {
            return cloudinaryService.upload2Cloudinary(file.buffer, folder, file.originalname);
        });

        const uploadResults = await Promise.all(uploadPromises);
        const failedUploads = uploadResults.every(result => result && result.url);

        if (!failedUploads) {
            throw new Error('File upload failed');
        }
        const links = uploadResults.map(result => result.url);
        const countMessages = await Message.countDocuments();
        let messageID = '';
        if (countMessages === 0) {
            messageID = 'MSG00001';
        } else {
            const lastMessage = await Message.findOne().sort({ createdAt: -1 });
            const lastMessageID = lastMessage.messageID;
            const newMessageID = parseInt(lastMessageID.replace('MSG', '')) + 1;
            messageID = 'MSG' + String(newMessageID).padStart(5, '0');
        }

        const newMessage = new Message({
            _id: uuidv4(),
            messageID,
            chatID,
            senderID,
            content: null,
            type: MessageType.FILE,
            status: MessageStatus.SENDING,
            filename,
            replyTo,
            pinnedInfo: null,
        });
        await newMessage.save();

        const lastMessage = await Message.findOne({ chatID }).sort({ createdAt: -1 });
        if (!lastMessage) {
            throw new Error("No messages found for the given chatID");
            return;
        }
        return {
            _id: lastMessage._id,
            messageID: lastMessage.messageID,
            chatID: lastMessage.chatID,
            senderID: lastMessage.senderID,
            content: lastMessage.content,
            type: lastMessage.type,
            status: lastMessage.status,
            filename: lastMessage.filename,
            replyTo: lastMessage.replyTo,
            pinnedInfo: lastMessage.pinnedInfo,
            createdAt: datetimeFormatter.formatDateVN(lastMessage.createdAt),
            updatedAt: datetimeFormatter.formatDateVN(lastMessage.updatedAt)
        };
    } catch (error) {
        console.error("Error creating file reply message:", error);
        throw error;
    }
}
const createMessageImageReply = async ({ chatID, senderID, replyTo, images }) => {
    try {
        if (!images || images.length === 0) {
            throw new Error('No images provided');
            return;
        }
        const uploadPromises = images.map(image => {
            return cloudinaryService.upload2Cloudinary(image.buffer, folder, image.originalname);
        });

        const uploadResults = await Promise.all(uploadPromises);
        const failedUploads = uploadResults.every(result => result && result.url);

        if (!failedUploads) {
            throw new Error('Image upload failed');
        }

        const links = uploadResults.map(result => result.url);
        const countMessages = await Message.countDocuments();
        let messageID = '';
        if (countMessages === 0) {
            messageID = 'MSG00001';
        } else {
            const lastMessage = await Message.findOne().sort({ createdAt: -1 });
            const lastMessageID = lastMessage.messageID;
            const newMessageID = parseInt(lastMessageID.replace('MSG', '')) + 1;
            messageID = 'MSG' + String(newMessageID).padStart(5, '0');
        }
        const newMessage = new Message({
            _id: uuidv4(),
            messageID,
            chatID,
            senderID,
            content: links.join(','), // Join multiple links with a comma
            type: MessageType.IMAGE,
            status: MessageStatus.SENDING,
            filename: null,
            replyTo,
            pinnedInfo: null,
        });
        await newMessage.save();

        const lastMessage = await Message.findOne({ chatID }).sort({ createdAt: -1 });

        if (!lastMessage) {
            throw new Error("No messages found for the given chatID");
            return;
        }
        
        return {
            _id: lastMessage._id,
            messageID: lastMessage.messageID,
            chatID: lastMessage.chatID,
            senderID: lastMessage.senderID,
            content: lastMessage.content,
            type: lastMessage.type,
            status: lastMessage.status,
            filename: lastMessage.filename,
            replyTo: lastMessage.replyTo,
            pinnedInfo: lastMessage.pinnedInfo,
            createdAt: datetimeFormatter.formatDateVN(lastMessage.createdAt),
            updatedAt: datetimeFormatter.formatDateVN(lastMessage.updatedAt)
        };
        
    } catch (error) {
        console.error("Error creating image reply message:", error);
        throw error;
    }
}

const createdMessagePinned = async ({ chatID,messageID, pinnedBy }) => {
    try {
        const message = await Message.findOne({ chatID, messageID });
        if (!message) {
            throw new Error("Message not found");
        }
        message.pinnedInfo = {
            messageID,
            pinnedBy,
            pinnedDate: new Date()
        };
        await message.save();
        return message;
    } catch (error) {
        console.error("Error creating pinned message:", error);
        throw error;
    }
}

const getMessagesByChatID = async (chatID, page = 1, pageSize = 10) => {
    try {
        if (!chatID) {
            throw new Error('chatID is required');
        }

        const page_num = parseInt(page) || 1;
        const pageSize_num = parseInt(pageSize) || 10;

        // Get total count of messages
        const count = await Message.countDocuments({ chatID });

        // Calculate skip from newest messages
        const skip = (page_num - 1) * pageSize_num;
        
        // Get messages with pagination
        const messages = await Message.find({ chatID })
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(pageSize_num)
            .sort({ createdAt: 1 }); // Re-sort to display in chronological order

        // Format messages
        const formattedMessages = messages.map(msg => ({
            ...msg.toObject(),
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt
        }));

        // Calculate pagination links
        const hasMore = count > (skip + pageSize_num);
        const hasNewer = page_num > 1;

        const linkPrev = hasMore ? 
            `/api/messages/${chatID}?page=${page_num + 1}&pagesize=${pageSize_num}` : null;
        const linkNext = hasNewer ? 
            `/api/messages/${chatID}?page=${page_num - 1}&pagesize=${pageSize_num}` : null;

        // Calculate pages array
        const totalPages = Math.ceil(count / pageSize_num);
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i >= page_num && i < page_num + 3) {
                pages.push(i);
            }
        }

        return {
            total: count,
            page: page_num,
            pageSize: pageSize_num,
            messages: formattedMessages,
            linkPrev,
            linkNext,
            pages
        };

    } catch (error) {
        console.error("Error retrieving messages by chatID:", error);
        throw error;
    }
};

const updateMessageStatus = async (messageID, status) => {
    try {
        const updatedMessage = await Message.findByIdAndUpdate(
            messageID,
            { status, updatedAt: datetimeFormatter.formatDateVN(new Date()) },
            { new: true }
        );  
        return updatedMessage;
        
    } catch (error) {
        console.error("Error updating message status:", error);
        throw error;
    }
}

const getLastMessageByChatID = async (chatID) => {
    try {
        const lastMessage = await Message.findOne({ chatID }).sort({ createdAt: -1 });
        if (!lastMessage) {
            throw new Error("No messages found for the given chatID");
            return;
        }
        return {
            _id: lastMessage._id,
            messageID: lastMessage.messageID,
            chatID: lastMessage.chatID,
            senderID: lastMessage.senderID,
            content: lastMessage.content,
            type: lastMessage.type,
            status: lastMessage.status,
            filename: lastMessage.filename,
            replyTo: lastMessage.replyTo,
            pinnedInfo: lastMessage.pinnedInfo,
            createdAt: lastMessage.createdAt,
            updatedAt: lastMessage.updatedAt
        };


    } catch (error) {
        console.error("Error retrieving last message by chatID:", error);
        throw error;
    }
}




module.exports = {
    createMessageText,
    createMessageFile,
    createMessageImage,
    getMessagesByChatID,
    updateMessageStatus,
    createMessageTextReply,
    createMessageFileReply,
    createMessageImageReply,
    createdMessagePinned,
    getLastMessageByChatID
}
