export default function allWordsModel(sequelize, DataTypes) {
  return sequelize.define('allword', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    word: {
      allowNull: false,
      type: DataTypes.STRING,

    },
  }, { underscored: true });
}
