const redisService = require('./redis.service');

// Tạo OTP ngẫu nhiên 6 số
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Gửi OTP qua sms
const sendOTP = async (phoneNumber) => {
    try {
        // Tạo OTP
        const otp = generateOTP();
        // Lưu OTP vào Redis với thời gian hết hạn 3 phút
        const redisKey = `otp:${phoneNumber}`;
        await redisService.setex(redisKey, 180, otp);
        // Gửi OTP qua SMS (giả lập)
        console.log(`Sending OTP ${otp} to phone number ${phoneNumber}`);
        return { success: true, message: 'OTP đã được gửi' };
    } catch (error) {
        console.error('Error sending OTP:', error);
        return { success: false, message: 'Gửi OTP thất bại' };
    }
};

// Xác thực OTP
const verifyOTP = async (phoneNumber, inputOTP) => {
    try {
        // Lấy OTP từ Redis
        const redisKey = `otp:${phoneNumber}`;
        const storedOTP = await redisService.get(redisKey);
        if (!storedOTP) {
            return {
                success: false,
                message: 'OTP đã hết hạn hoặc không tồn tại'
            };
        }
        // So sánh OTP
        if (storedOTP === inputOTP) {
            // Xóa OTP khỏi Redis sau khi xác thực thành công
            await redisService.del(redisKey);
            // Tạo token đặt lại mật khẩu có thời hạn 5 phút
            const resetToken = crypto.randomUUID() + inputOTP;
            await redisService.setex(`reset:${phoneNumber}`, 300, resetToken);
            return {
                success: true,
                message: 'Xác thực OTP thành công',
                resetToken: resetToken
            };
        } else {
            return {
                success: false,
                message: 'OTP không chính xác'
            };
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw new Error('Lỗi xác thực OTP. Vui lòng thử lại sau.');
    }
};

module.exports = {
    sendOTP,
    verifyOTP
};