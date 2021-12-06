const config = {
    host: process.env.DB_HOST || "localhost", // set this environment variable on the production server
    port: 3306,
    adminUser: "Quantic_Dev",
    adminPassword: "Quantic_Dev",
    db: "ev_ratings",
    dialect: "mysql",
    user: "ratemyev_user",
    password: "ratemyev_user",
};

module.exports = config;