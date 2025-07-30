import { Sequelize, DataTypes } from "sequelize";
import { committeeInit } from "../models/commitee.js";
import { countryInit } from "../models/countries.js";
import { motionInit } from "../models/motion.js";
import { motionSpeakersInit } from "../models/motionSpeakers.js";
import { votingHistoryInit } from "../models/votingHistory.js";
const db = {};

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./mydb.sqlite",
});

db.committee = committeeInit(sequelize, DataTypes);
db.country = countryInit(sequelize, DataTypes);
db.motion = motionInit(sequelize, DataTypes);
db.motionSpeakers = motionSpeakersInit(sequelize, DataTypes);
db.votingHistory = votingHistoryInit(sequelize, DataTypes);
db.sequelize = sequelize;

Object.values(db).forEach((model) => {
  if (model.associate) model.associate(db);
});

export default db;
