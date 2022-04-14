const Sequelize = require('sequelize');
const conn = require('./conn');

const Note = conn.define('note', {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  content: {
    type: Sequelize.TEXT
  }
})

module.exports = {
  Note
}