const Sequelize = require('sequelize');
const { Role, StatusAccount } = require("./enums");
const bcrypt = require("bcrypt");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Account', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "user_id"
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "email"
    },
    phone_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "phone_number"
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM(...Object.values(Role)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(StatusAccount)),
      allowNull: false,
    }
  }, {
    sequelize,
    tableName: 'accounts',
    timestamps: true,
    hooks: {
      beforeValidate: async (account) => {
        const { role, user_id } = account;
        if (role === 'STUDENT') {
          const s = await sequelize.models.Student.findOne({ where: { student_id: user_id } });
          if (!s) throw new Error('student_id not exist');
        } else if (role === 'LECTURER') {
          const l = await sequelize.models.Lecturer.findOne({ where: { lecturer_id: user_id } });
          if (!l) throw new Error('lecturer_id not exist');
        } else if (role === 'PARENT') {
          const p = await sequelize.models.Parent.findOne({ where: { parent_id: user_id } });
          if (!p) throw new Error('parent_id not exist');
        }
      },
      beforeCreate: async (account) => {
        if (account.password) {
          account.password = await bcrypt.hash(account.password, 10);
        }
      },
      beforeUpdate: async (account) => {
        if (account.changed("password")) {
          account.password = await bcrypt.hash(account.password, 10);
        }
      }
    },
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "user_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
};
