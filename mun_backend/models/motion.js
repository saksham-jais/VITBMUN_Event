export const motionTypes = ["mod", "unmod", "other"];

export const motionInit = (sequelize, DataTypes) => {
  const motion = sequelize.define(
    "motion",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        // autoIncrement removed because it is not valid for STRING type
      },
      topic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM,
        values: motionTypes,
        allowNull: false,
        defaultValue: "other",
        validate: {
          isIn: [motionTypes],
        },
      },
      totalDuration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      speakingTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      otherDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
    }
  );
  motion.associate = (models) => {
    motion.belongsTo(models.committee, {
      foreignKey: "committeeId",
      as: "committee",
    });
    motion.belongsTo(models.country, {
      foreignKey: "countryId",
      as: "country",
    });
    motion.belongsToMany(models.country, {
      through: models.motionSpeakers,
      foreignKey: "motionId",
      as: "speakers",
    });
  };

  return motion;
};
