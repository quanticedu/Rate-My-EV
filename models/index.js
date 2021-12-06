const dbConfig = require('./dbconfig');
const Sequelize = require('sequelize');
const mysql = require('mysql2');

// create the database if it doesn't exist
// TODO: error handling
const connection = mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.adminUser,
    password: dbConfig.adminPassword
});

connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.db};`, (err) => {
    if (err) {
        throw err;
}});

connection.end((err) => {
    if (err) {
        throw err;
}});

// log in with admin credentials to sync the database
const sequelize = new Sequelize(dbConfig.db, dbConfig.adminUser, dbConfig.adminPassword, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
});

const db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    Token: require('./token')(sequelize, Sequelize),
    CarModel: require('./carModel')(sequelize, Sequelize),
    RatingHeader: require('./ratingHeader')(sequelize, Sequelize),
    Rating: require('./rating')(sequelize, Sequelize),
};

db.CarModel.hasMany(db.Token, { onDelete: 'CASCADE' });
db.Token.belongsTo(db.CarModel, { foreignKey: { allowNull: false }});

db.Token.hasMany(db.Rating, { onDelete: 'CASCADE' });
db.Rating.belongsTo(db.Token, { foreignKey: { allowNull: false }});

db.RatingHeader.hasMany(db.Rating, { onDelete: 'CASCADE' });
db.Rating.belongsTo(db.RatingHeader, { foreignKey: { allowNull: false }});

// TODO: sync() returns a promise. figure out a way to avoid race conditions
// TODO: use migrations instead of alter: true (see https://sequelize.org/master/manual/migrations.html)
sequelize.sync({ alter: true });

// now log in with user-level credentials
db.sequelize = new Sequelize(dbConfig.db, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
});

module.exports = db;
