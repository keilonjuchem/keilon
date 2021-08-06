const mysql = require("mysql2");

//conectar ao banco e exportar conexao para que o index.js posso fazer queries
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "cnpj",
});

module.exports = connection;
