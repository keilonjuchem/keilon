//importar dependencias e bibliotecas
const express = require("express");
const app = express();
const db = require("./db");
const fetch = require("node-fetch");
const cors = require("cors");

//configurar cross-origin-policy
app.use(cors());
//sempre ler bodies como json
app.use(express.json());

//rotar para pegar todas as consultas anteriores
app.route("/consultas").get(async (req, res) => {
  //formatar ip do cliente
  let ip = req.socket.remoteAddress;
  ip = ip.substring(ip.lastIndexOf(":") + 1, ip.length);
  if (ip === "1") ip = "127.0.0.1";
  ip = ip.replace(/\./g, "");

  //recuperar consultas anteriores do cliente
  db.execute(
    "SELECT * FROM consultas WHERE ip = ? ORDER BY t DESC",
    [ip],
    (error, results, _fields) => {
      if (error) res.sendStatus(500);
      res.json({ results });
    }
  );
});

//rota para requisitar a api por informacoes de um cnpj
app.get("/consultas/:cnpj", (req, res) => {
  //verificar cnpj
  const cnpj = req.params.cnpj;
  if (!cnpj || cnpj.length !== 14) return res.sendStatus(400);

  //verificar se deve-se registrar a consulta no banco
  const isVisualizandoNovamente = req.query.isVisualizandoNovamente;

  //formatar ip do cliente
  let ip = req.socket.remoteAddress;
  ip = ip.substring(ip.lastIndexOf(":") + 1, ip.length);
  if (ip === "1") ip = "127.0.0.1";
  ip = ip.replace(/\./g, "");

  //requisitar informacoes do cnpj para a api
  fetch("https://consulta-cnpj-gratis.p.rapidapi.com/companies/" + cnpj, {
    method: "GET",
    headers: {
      "x-rapidapi-host": "consulta-cnpj-gratis.p.rapidapi.com",
      "x-rapidapi-key": "4e524ccf58msh3ecb8cf44fadd7fp1ffaa4jsnb584f98b0042",
    },
  })
    .then((response) => response.json())
    .then((response) => {
      //caso o cnpj tenha sido invalido, responder com erro que o cliente vai resolver
      if (response.error === 400) {
        return res.sendStatus(400);
      }

      //enviar resposta da api para o cliente
      res.json(response);

      //registrar consulta no banco
      try {
        //nao registrar caso o cliente esteja revendo uma consulta previa
        if (isVisualizandoNovamente) {
          return;
        }
        //registrar
        db.execute("INSERT IGNORE INTO consultas (ip, cnpj) VALUES(?, ?)", [
          ip,
          cnpj,
        ]);
      } catch (error) {
        console.log(error);
      }
    })
    .catch((error) => {
      console.log("ERROU", error);
    });
});

//servidor rodará na porta 5000 por padrão
const port = process.env.PORT | 5000;
app.listen(port, () => console.log(`Escutando na porta ${port}`));
