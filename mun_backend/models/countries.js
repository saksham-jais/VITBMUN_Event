export const allowedCountries = ["Mexico", "USA", "India"];
export const attendanceValues = ["Present", "Present and Voting", "Absent"];
export const gslValues = ["open", "queued", "spoken"];

export const countryInit = (sequelize, DataTypes) => {
  const country = sequelize.define(
    "country",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      attendance: {
        type: DataTypes.ENUM,
        values: attendanceValues,
        defaultValue: "Absent",
        validate: {
          isIn: [attendanceValues],
        },
      },
      gsl: {
        type: DataTypes.ENUM,
        values: gslValues,
        defaultValue: "open",
      },
    },
    {
      timestamps: true,
    }
  );

  country.associate = (models) => {
    country.hasMany(models.motion, {
      foreignKey: "countryId",
      as: "motions",
    });
  };
  return country;
};
