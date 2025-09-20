const Sequelize = require('sequelize');
const { StatusAttendance } = require("./enums");

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('AttendanceStudent', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    attendances_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'attendances',
        key: 'id'
      }
    },
    student_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'students',
        key: 'student_id'
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(StatusAttendance)),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    start_lesson: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    end_lesson: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'attendances_students',
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
        name: "attendances_id",
        using: "BTREE",
        fields: [
          { name: "attendances_id" },
        ]
      },
      {
        name: "student_id",
        using: "BTREE",
        fields: [
          { name: "student_id" },
        ]
      },
      {
        name: "attendances_student_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "attendances_id" },
          { name: "student_id" },
        ]
      },
    ]
  });
};