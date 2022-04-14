const Sequelize = require('sequelize');
const config = {
  logging: false
};
if(process.env.LOGGING){
  delete config.logging;
}
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db', config);

module.exports = conn;