export default function gameModel(sequelize, DataTypes) {
  return sequelize.define('game', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    wordleId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'wordles',
        key: 'id',
      },
    },
    gameState: {
      type: DataTypes.JSON,
    },
    playerId: {
      type: DataTypes.STRING,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  }, { underscored: true });
}
