module.exports = (sequelize, Sequelize) => {
    const Rating = sequelize.define("Rating", {
        rating: { 
            type: Sequelize.INTEGER, 
            allowNull: false, 
        },
        isTest: { 
            type: Sequelize.BOOLEAN, 
            allowNull: false, 
            defaultValue: false },
    });

    return Rating;
};