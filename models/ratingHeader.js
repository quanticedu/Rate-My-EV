module.exports = (sequelize, Sequelize) => {
    const RatingHeader = sequelize.define("RatingHeader", {
        header: { 
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            notEmpty: true
        },
        isTest: { 
            type: Sequelize.BOOLEAN, 
            allowNull: false,
            defaultValue: false },
    });

    return RatingHeader;
};