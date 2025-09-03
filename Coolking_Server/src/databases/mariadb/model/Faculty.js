const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Faculty', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    faculty_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "faculty_id"
    },
    dean_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: 'lecturers',
        key: 'lecturer_id'
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
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
    }
  }, {
    sequelize,
    tableName: 'faculties',
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
        name: "faculty_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "faculty_id" },
        ]
      },
      {
        name: "fk_faculty_dean",
        using: "BTREE",
        fields: [
          { name: "dean_id" },
        ]
      },
    ]
  });
};
