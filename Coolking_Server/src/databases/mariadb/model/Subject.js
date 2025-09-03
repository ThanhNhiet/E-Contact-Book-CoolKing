const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Subject', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    subject_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "subject_id"
    },
    faculty_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'faculties',
        key: 'faculty_id'
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    theo_credit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pra_credit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'subjects',
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
        name: "subject_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "subject_id" },
        ]
      },
      {
        name: "faculty_id",
        using: "BTREE",
        fields: [
          { name: "faculty_id" },
        ]
      },
    ]
  });
};
