export const committeeInit = (sequelize, DataTypes) => {
  const Committee = sequelize.define(
    "committee",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: 1,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );
  Committee.associate = (models) => {
    Committee.hasMany(models.motion, {
      foreignKey: "committeeId",
      as: "motions",
    });
    Committee.hasMany(models.country, {
      foreignKey: "committeeId",
      as: "countries",
    });
  };

  return Committee;
};
