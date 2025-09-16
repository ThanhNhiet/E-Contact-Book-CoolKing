const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ScheduleException', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    schedule_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'schedules',
        key: 'id'
      }
    },
    exception_type: {
      type: DataTypes.ENUM('CANCELED', 'MAKEUP', 'ROOM_CHANGED', 'LECTURER_CHANGED'),
      allowNull: false
    },
    original_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    new_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    new_room: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    "new_start_lesson": {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    "new_end_lesson": {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    new_lecturer_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: 'lecturers',
        key: 'lecturer_id'
      }
    }
  }, {
    sequelize,
    tableName: 'schedule_exceptions',
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
        name: "schedule_id",
        using: "BTREE",
        fields: [
          { name: "schedule_id" },
        ]
      }
    ]
  });
};
