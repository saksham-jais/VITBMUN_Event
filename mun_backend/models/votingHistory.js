export const votingHistoryInit = (sequelize, DataTypes) => {
    const VotingHistory = sequelize.define(
    "votingHistory",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        history:{
            type: DataTypes.TEXT,
            allowNull: false,
        }
        
    });

    return VotingHistory;
}