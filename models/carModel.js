module.exports = (sequelize, Sequelize) => {
    const CarModel = sequelize.define("CarModel", {
        name: { 
            type: Sequelize.STRING, 
            allowNull: false, 
            unique: true,
            notEmpty: true,
        },
        isTest: { 
            type: Sequelize.BOOLEAN, 
            allowNull: false, 
            defaultValue: false },
    });

    return CarModel;
};