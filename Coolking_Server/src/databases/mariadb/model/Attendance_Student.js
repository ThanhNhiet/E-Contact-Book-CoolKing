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
    attendance_id: {
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
          { name: "attendance_id" },
        ]
      },
      {
        name: "student_id",
        using: "BTREE",
        fields: [
          { name: "student_id" },
        ]
      }
    ]
  });
};