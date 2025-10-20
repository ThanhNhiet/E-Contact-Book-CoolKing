const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Staff', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    staff_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "staffs_ibfk_1"
    },
    admin_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      unique: "staffs_ibfk_2"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    gender: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'staffs',
    timestamps: true,
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
        name: "staff_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "staff_id" },
        ]
      },
      {
        name: "admin_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "admin_id" },
        ]
      }
    ]
  });
};
