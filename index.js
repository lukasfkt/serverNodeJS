const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require("sequelize");
const database = require('./models');

const app = express();

app.use(bodyParser.json());

const port = 8080;

app.get('/test', (req, res) => res
  .status(200)
  .send({
    mensagem: 'Boa vindas!'
  }));

app.get('/time', function (req, res) {
  var data = new Date();
  res.status(200).send(data);
})

app.get('/all', async function (req, res) {
  const result = await database.medicoes.findAll()
  res.status(200).send(result);
})

app.get('/lastHour', async function (req, res) {
  var data = new Date();
  data.setHours(data.getHours() - 1)
  const { Op } = require("sequelize");
  const result = await database.medicoes.findAll({
    where: {
      time: {
        [Op.gte]: data,
      }
    }
  })
  res.status(200).send(result);
})

app.post("/sendData", function (req, res) {
  var data = new Date();
  const add = database.medicoes.create({
    'type': req.body.type,
    'medDate': req.body.medDate,
    'time': data,
  }).then(function (result) {
    res.send("Dado inserido com sucesso")
  }).catch(function (err) {
    res.send("Erro no cadastro do dado" + err)
  })

})

app.listen(port, () => console.log(`servidor rodando na porta ${port}`));

module.exports = app;