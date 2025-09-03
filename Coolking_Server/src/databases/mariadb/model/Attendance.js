const Sequelize = require('sequelize');
const { StatusAttendance } = require("./enums");
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Attendance', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    student_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'students',
        key: 'student_id'
      }
    },
    created_by: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'lecturers',
        key: 'lecturer_id'
      }
    },
    course_section_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'course_sections',
        key: 'id'
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
    tableName: 'attendances',
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
        using: "BTREE",
        fields: [
          { name: "student_id" },
        ]
      },
      {
        name: "created_by",
        using: "BTREE",
        fields: [
          { name: "created_by" },
        ]
      },
      {
        name: "course_section_id",
        using: "BTREE",
        fields: [
          { name: "course_section_id" },
        ]
      },
    ]
  });
};
