const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Lecturer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    lecturer_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "lecturers_ibfk_1"
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
    faculty_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'faculties',
        key: 'faculty_id'
      }
    },
    homeroom_class_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'clazz',
        key: 'id'
      }
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'lecturers',
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
        name: "lecturer_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "lecturer_id" },
        ]
      },
      {
        name: "faculty_id",
        using: "BTREE",
        fields: [
          { name: "faculty_id" },
        ]
      },
      {
        name: "homeroom_class_id",
        using: "BTREE",
        fields: [
          { name: "homeroom_class_id" },
        ]
      }
    ]
  });
};
