const {Client} = require('pg');

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
});

client.connect((error) => {
    if (error !== null) {
        console.log("Cannot connect to database !", error);
    } else {
        console.log("Connected to database!");
    };
});

module.exports = client;

