const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require("sequelize");
const database = require('./models');

const app = express();

const privateKey = `
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAgKKMx1IPFtZMk7huQanBBaTiSVRv90ipvS+l1X1ybDtj9EYJ
1ALUAjKehiCEkQ74riSdupoMavF2+rBBoVskZtjY/uVzKmD0aBh9ftTnEDE3QFHV
wfoAfVYYKHD0qG5dw26qAY/tVSxVZnJvl8rUWmJoqhWe5Esxi4ODbh8GT32BU6st
ctjoh4nuP+qGo6pPqSPVLQhCWFflcC0DQ075wKVBjZQ+heaMpUwKQVOoFRJK3oFx
im877H53crtLWnPpOSKRtLFM0GoCQUSD9GVzS+1se5h4vUEAscCg+8WFOBJC/IAq
48+ePC6uO4t3FVM6dp6VQeDqCsRMFRXM3+/beQIDAQABAoIBABeuVR5oo/B/WS+k
t1+NQcSpOyNm0QoELYNvnybzZjo4oMkaj7qhHqic6wQkPmN6Dxv4D7WHoJubglza
T+rFnaj1aNVcJlx55uS3BXtw9GzNsq87oY+JV8e7Ls1bJh9P2iEdYVzSQ0330G0A
yjx2katmDICrZEoA8ckOWAbQ3VeKrAsal6eKYaGXE0GVGiOR0UxUYk2NWWmRk8lr
EIoU2nyxdhJ5N+s0Cw97d1LNAv1oZYvqPUKqeEfJBZq+3PDP8SbbZj2jSN6dHMFp
4uwUl7xNGbvpbfaCk6gWjZNH/MoxzQ9Nu5IXtz/LIyikjFG2172Dc5nou5zyIGSZ
Z6MMKoECgYEA+rhVBKoq3QBtlSCL5NW01sTZ1Rkr5/0oihPbhk2c3dVo4dmfbswY
BE70/lHcIEfR7ANI+jjgGRHK3Cj83D7SDrRWB1TyQwOSfj3Hig7lq5YeW85m7S62
T24YhEKNlk0F8HXKxK71s78YXyJekuC0aW8AsrzMkWc0lYjWuU1oNGkCgYEAg1gK
HiEjfDgkXzgwBWkhRRLDnFo6dRJn9cRa89J3APW9c0n21w70/vVMD0LTr7nUEqIa
7SV5F2QVlbvYtYR5j4QWSynh/tUYoIqNCAdU4WL/NX19uMuz9WzGBB0aT5XX/g20
V0squsdiwof2fP5h+UYEF2jfhcb6/HJy+L4jTJECgYA1adPi/IXJM3AlFxv2knjG
UIW/2m76K3rZf8WC5UIIGJERnJVUu3JaaJ/VFod48RQN3d1MQZWsgZfgM3M7UL7b
lxvE0BoUoMwyzOKXzPitB3xMPrq6yPraDTB37N3RKXOceNvL7yI1Ov7sNZxEWk7V
L2rMqWBDkeMoAFEOhSkwEQKBgGZz2UiRTu3JmU2RNZwy2lnX/i/LDgheOCu0Y8IH
bP6ZsZLpohs1NpReYVsSJK/RQ4TZYCmV7nP5hQDMi4lj8bKqNP2iiP/P16r7CHG3
zlUVdL+TyOrKMvEBTSDOVsS3vMkWhZMGNimF+BqIFhSAFYptPCnKi3j9srAS0m4H
Wt+RAoGBAKo3EBGWihYgiTsHJ9aeseX1DQ8tzZ5MJKj5sf3WZ7qWikxPHzFygvTy
5J3tsWRsHVmHrXr3fJqPmhbO1dhA7uef/qA41pMO/wj5+ZgaF1tMcA9FCQkyepuO
BVVJYqC6t0nxYs0RU6D6CpSKhgyTepAGmgIfRmNOeUgTngmrGR26
-----END RSA PRIVATE KEY-----`

app.use(bodyParser.json());

const port = 8080;

app.get('/test', (req, res) => res
  .status(200)
  .send({
    mensagem: 'Boa vindas!'
  }));

app.post("/testrsa", function (req, res) {
  var decodedStringAtoB = atob(req.body.message);
  var params = req.body;
  res.status(200).send(req.body);
  /*   const decryptedData = crypto.privateDecrypt(
      {
        key: privateKey,
        // In order to decrypt the data, we need to specify the
        // same hashing function and padding scheme that we used to
        // encrypt the data in the previous step
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha128",
      },
      decodedStringAtoB
    );
    res.status(200).send(decodedStringAtoB); */
})

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
  var date = new Date();
  const add = database.medicoes.create({
    'type': req.body.type,
    'medData': req.body.medData,
    'time': date,
    'userId': req.body.userId,
  }).then(function (result) {
    res.send("Dado inserido com sucesso")
  }).catch(function (err) {
    res.send("Erro no cadastro do dado" + err)
  })
})

app.post("/createDefaultConfig", function (req, res) {
  const add = database.UserConfig.create({
    'gasCozinha': req.body.gasCozinha,
    'fluxoAgua': req.body.fluxoAgua,
    'fumaca': req.body.fumaca,
    'temperatura': req.body.temperatura,
    'userId': req.body.userId
  }).then(function (result) {
    res.send("Configuracoes alteradas com sucesso!")
  }).catch(function (err) {
    res.send("Erro na atualizacao das configuracoes" + err)
  })
})

app.patch("/updateUserConfig", function (req, res) {
  const add = database.UserConfig.update({
    'gasCozinha': req.body.gasCozinha,
    'fluxoAgua': req.body.fluxoAgua,
    'fumaca': req.body.fumaca,
    'temperatura': req.body.temperatura,
    'userId': req.body.userId
  },
    {
      where: { userId: req.body.userId },
    }
  ).then(function (result) {
    res.send("Configuracoes alteradas com sucesso!")
  }).catch(function (err) {
    res.send("Erro na atualizacao das configuracoes" + err)
  })
})

app.listen(port, () => console.log(`servidor rodando na porta ${port}`));

module.exports = app;