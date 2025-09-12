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

    // Loại lịch: lịch thường, lịch bù, thi
    type: {
      type: DataTypes.ENUM('REGULAR', 'MAKEUP', 'EXAM'),
      allowNull: false,
      defaultValue: 'REGULAR'
    },

    // Thứ trong tuần (1-7), chỉ áp dụng cho lịch thường
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    // Trường hợp nếu bị cancel -> hoặc là ngày thi hoặc lịch bù
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    room: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
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
    status: {
      type: DataTypes.ENUM('SCHEDULED', 'COMPLETED', 'CANCELED'),
      allowNull: false,
      defaultValue: 'SCHEDULED'
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
