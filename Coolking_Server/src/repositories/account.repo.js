const sequelize = require("../config/mariadb.conf"); 
const initModels = require("../databases/mariadb/model/init-models");
const models = initModels(sequelize);
const bcrypt = require("bcrypt");

const login = async (username, password) => {
  try {
    // Phân loại username dựa trên định dạng
    let whereClause = {};
    
    // Kiểm tra xem username có phải là email không
    if (username.includes('@') && username.includes('.')) {
      whereClause = { email: username };
    } 
    // Kiểm tra xem username có phải là số điện thoại không (chỉ chứa số, dấu + và dấu -)
    else if (/^[0-9+\-\s]+$/.test(username)) {
      whereClause = { phone_number: username };
    } 
    // Kiểm tra xem username có phải là user_id không (bắt đầu bằng ST, PA, LE, AD)
    else if (/^(ST|PA|LE|AD)/.test(username)) {
      whereClause = { user_id: username };
    } 
    // Nếu không khớp với bất kỳ mẫu nào, thử tìm kiếm trong tất cả các trường
    else {
      const { Op } = require('sequelize');
      whereClause = {
        [Op.or]: [
          { user_id: username },
          { email: username },
          { phone_number: username }
        ]
      };
    }
    
    const account = await models.Account.findOne({ where: whereClause });
    
    if (!account) throw new Error("Account not found");
    if (account.status === 'INACTIVE') throw new Error("Account is not active");
    const isValid = await bcrypt.compare(password, account.password);
    if (!isValid) throw new Error("Invalid password");
    return account;
  } catch (error) {
    throw error;
  }
};

const changePassword = async (user_id, oldPassword, newPassword) => {
  try {
    const account = await models.Account.findOne({ where: { user_id } });
    console.log(account.user_id);
    if (!account) throw new Error("Account not found");
    const isValid = await bcrypt.compare(oldPassword, account.password);
    if (!isValid) throw new Error("Invalid old password");
    account.password = newPassword;
    await account.save();
    return account;
  } catch (error) {
    throw error;
  }
};

const getAllAccounts_paging = async (page, pageSize) => {
  try {
    const offset = (page - 1) * pageSize;
    const pageSize_num = parseInt(pageSize);
    const { count, rows } = await models.Account.findAndCountAll({ 
      attributes: { exclude: ['password'] },
      limit: pageSize_num, 
      offset 
    });
    const linkPrev = page > 1 ? `/api/accounts?page=${page - 1}&pagesize=${pageSize_num}` : null;
    const linkNext = (page - 1) * pageSize_num + rows.length < count ? `/api/accounts?page=${page + 1}&pagesize=${pageSize_num}` : null;
    //nếu đang ở trang 1 thì 3pages là [1, 2, 3], nếu đang ở trang 2 thì 3pages là [2, 3, 4]
    const pages = [];
    for (let i = 1; i <= Math.ceil(count / pageSize_num); i++) {
      if (i >= page && i < page + 3) {
        pages.push(i);
      }
    }
    return { total: count, page: page, pageSize: pageSize_num, accounts: rows, linkPrev, linkNext, pages };
  } catch (error) {
    throw error;
  }
};

const getAccountByUserId = async (user_id) => {
  try {
    return await models.Account.findOne({ 
      attributes: { exclude: ['password'] }, // Loại trừ trường password
      where: { user_id } 
    });
  } catch (error) {
    throw error;
  }
};

const createAccount = async (accountData) => {
  try {
    return await models.Account.create(accountData);
  } catch (error) {
    throw error;
  }
};

const updateAccount = async (user_id, accountData) => {
  try {
    const account = await models.Account.findOne({ where: { user_id } });
    if (!account) throw new Error("Account not found");
    return await account.update(accountData);
  } catch (error) {
    throw error;
  }
};

const deleteAccount = async (user_id) => {
  try {
    const account = await models.Account.findOne({ where: { user_id } });
    if (!account) throw new Error("Account not found");
    account.status = 'INACTIVE';
    await account.save();
    return account;
  } catch (error) {
    throw error;
  }
};

const resetPassword4Admin = async (user_id) => {
  try {
    const account = await models.Account.findOne({ where: { user_id } });
    if (!account) throw new Error("Account not found");
    const newPassword = '12345678';
    account.password = newPassword;
    await account.save();
    return newPassword;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  login,
  changePassword,
  getAllAccounts_paging,
  getAccountByUserId,
  createAccount,
  updateAccount,
  deleteAccount,
  resetPassword4Admin
};
