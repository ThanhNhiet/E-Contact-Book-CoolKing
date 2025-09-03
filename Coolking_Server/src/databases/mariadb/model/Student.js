const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Student', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    student_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "students_ibfk_1"
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
    clazz_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'clazz',
        key: 'id'
      }
    },
    faculty_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'faculties',
        key: 'faculty_id'
      }
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'students',
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
        name: "student_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "student_id" },
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
        name: "clazz_id",
        using: "BTREE",
        fields: [
          { name: "clazz_id" },
        ]
      },
    ]
  });
};
