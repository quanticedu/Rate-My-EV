module.exports = (sequelize, Sequelize) => {
    const Token = sequelize.define("Token", {
        value: { 
            type: Sequelize.UUID, 
            allowNull: false, 
            defaultValue: Sequelize.UUIDV4, // this creates a new UUID each time a record is created
        },
        dateIssued: { 
            type: Sequelize.DATE,  
            allowNull: false, 
            defaultValue: () => Date.now() 
        },
        dateUsed: { 
            type: Sequelize.DATE, 
            defaultValue: null 
        },
        isTest: { 
            type: Sequelize.BOOLEAN, 
            allowNull: false, 
            defaultValue: false 
        },
    });

    return Token;
};