const sequelize = require("../config/mariadb.conf");
const initModels = require("../databases/mariadb/model/init-models");
const models = initModels(sequelize);
const datetimeFormatter = require("../utils/format/datetime-formatter");
const cloudinaryService = require("../services/cloudinary.service");
const cloudinaryUtils = require("../utils/cloudinary.utils");

const getParentByParent_id = async (parent_id) => {
  try {
    const result = await models.Parent.findOne({
      where: { parent_id }
    });
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getParentByParent_id
};