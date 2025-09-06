const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Major', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    major_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "major_id"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    faculty_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: 'faculties',
        key: 'faculty_id'
      }
    }
  }, {
    sequelize,
    tableName: 'majors',
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
        name: "major_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "major_id" },
        ]
      },
      {
        name: "fk_major_faculty",
        using: "BTREE",
        fields: [
          { name: "faculty_id" },
        ]
      },
    ]
  });
};
