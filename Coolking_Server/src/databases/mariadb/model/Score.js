const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Score', {
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
    course_section_id: {
      type:DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'course_sections',
        key: 'id'
      }
    },
    theo_regular1: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    theo_regular2: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    theo_regular3: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    pra_regular1: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    pra_regular2: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    pra_regular3: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    mid: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    final: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    avr: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'scores',
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
        name: "course_section_id",
        using: "BTREE",
        fields: [
          { name: "course_section_id" },
        ]
      },
    ]
  });
};
