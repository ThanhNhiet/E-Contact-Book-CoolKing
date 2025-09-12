const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Schedule', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'user_id'
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

    // Có phải lịch thi hay không
    isExam: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },

    // Thứ trong tuần (1-7)
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    // Áp dụng cho lịch thi
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    room: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    start_lesson: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    end_lesson: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    //Ngày bắt đầu lớp học phần
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    //Ngày kết thúc lớp học phần
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },

    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    tableName: 'schedules',
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
        name: "user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
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
