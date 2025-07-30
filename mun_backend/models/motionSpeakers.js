export const motionSpeakersInit = (sequelize, DataTypes) => {
  const motionSpeakers = sequelize.define("motionSpeakers", {
    motionId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "motion",
        key: "id",
      },
    },
    countryId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "country",
        key: "id",
      },
    },
  });

  return motionSpeakers;
};
