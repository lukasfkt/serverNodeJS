const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require("sequelize");
const database = require('./models');
const { json } = require('express');

const app = express();

app.use(bodyParser.json());

const port = 8080;

//========================================= TESTS =========================================

app.get("/test", function (req, res) {
  var date = new Date();
  date.setHours(date.getHours() - 3)
  res.status(200).send(date);
})

//========================================= GET MEDITIONS =========================================

app.get('/all', async function (req, res) {
  const result = await database.meditions.findAll()
  res.status(200).send(result);
  return;
})

app.get('/getLastMonthMed', async function (req, res) {
  if (!req.query.userId) {
    res.status(400).header("Payload incomplete").send("Payload incomplete")
    return;
  }
  var data = new Date();
  data.setDate(0);
  data.setHours(data.getHours() - 3)
  var temp = [], water = [], gases = [];
  var aux = [];
  var timeTemp = [], timeWater = [], timeGases = [];
  const { Op } = require("sequelize");
  const result = await database.meditions.findAll({
    where: {
      time: {
        [Op.gte]: data,
      },
      userId: {
        [Op.eq]: req.query.userId,
      },
    }
  })
  result.forEach(element => {
    d = new Date(element.time)
    var datestring = ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2);
    switch (element.type) {
      case "temp":
        if (timeTemp.includes(datestring)) {
          index = timeTemp.findIndex(dataToFind => dataToFind == datestring)
          temp[index] = temp[index] + element.medData
          aux['temp'][index] += 1;
        } else {
          temp.push(element.medData);
          timeTemp.push(datestring)
        }
        break;
      case "water":
        if (timeWater.includes(datestring)) {
          index = timeWater.findIndex(dataToFind => dataToFind == datestring)
          water[index] = water[index] + element.medData
          aux['water'][index] += 1;
        } else {
          water.push(element.medData);
          timeWater.push(datestring)
        }
        break;
      case "gases":
        if (timeGases.includes(datestring)) {
          index = timeGases.findIndex(dataToFind => dataToFind == datestring)
          gases[index] = gases[index] + element.medData
          aux['gases'][index] += 1;
        } else {
          gases.push(element.medData);
          timeGases.push(datestring)
        }
        break;
    }
  });
  res.status(200).json({ temp: temp, timeTemp: timeTemp, water: water, timeWater: timeWater, gases: gases, timeGases: timeGases });
  return;
})


// SENSOR GAS, TEMPERATURA, FUMACA E FLUXO DE AGUA
app.get('/getLastHourMed', async function (req, res) {
  if (!req.query.userId) {
    res.status(400).header("Payload incomplete").send("Payload incomplete")
    return;
  }
  var data = new Date();
  var temp = [], water = [], gases = [];
  var timeTemp = [], timeWater = [], timeGases = [];
  data.setHours(data.getHours() - 4)
  const { Op } = require("sequelize");
  const result = await database.meditions.findAll({
    where: {
      time: {
        [Op.gte]: data,
      },
      userId: {
        [Op.eq]: req.query.userId,
      },
    }
  })
  result.forEach(element => {
    d = new Date(element.time)
    var datestring = (("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2));
    switch (element.type) {
      case "temp":
        temp.push(element.medData);
        timeTemp.push(datestring)
        break;
      case "water":
        water.push(element.medData);
        timeWater.push(datestring)
        break;
      case "gases":
        gases.push(element.medData);
        timeGases.push(datestring)
        break;
    }
  });
  res.status(200).json({ temp: temp, timeTemp: timeTemp, water: water, timeWater: timeWater, gases: gases, timeGases: timeGases });
  return;
})

//========================================= WRITE MEDITIONS =========================================

app.post("/sendData", function (req, res) {
  var date = new Date();
  date.setHours(date.getHours() - 3)
  if (!req.query.userId && !req.query.type && !req.query.medData) {
    res.status(400).header("Payload incomplete").send("Payload incomplete")
    return;
  }
  if (req.body.type != "temp" && req.body.type != "water" && req.body.type != "gases") {
    res.status(410).header("Registration error").send("Invalid data")
    return;
  }
  database.meditions.create({
    'type': req.body.type,
    'medData': req.body.medData,
    'time': date,
    'userId': req.body.userId,
  }).then(function (result) {
    res.send("Dado inserido com sucesso")
  }).catch(function (err) {
    res.send("Erro no cadastro do dado" + err)
  })
  return;
})


//========================================= CONFIG =========================================

app.get("/getUserConfig", async function (req, res) {
  if (!req.query.userId) {
    res.status(400).header("Payload incomplete").send("Payload incomplete")
    return;
  }
  const { Op } = require("sequelize");
  const result = await database.UserConfig.findAll({
    where: {
      userId: {
        [Op.eq]: req.query.userId,
      },
    }
  })
  res.status(200).send(result[0]);
  return;
})

app.post("/createDefaultConfig", function (req, res) {
  if (!req.query.gases && !req.query.water && !req.query.temp && !req.query.userId) {
    res.status(400).header("Payload incomplete").send("Payload incomplete")
    return;
  }
  const add = database.UserConfig.create({
    'gases': req.body.gases,
    'water': req.body.water,
    'temp': req.body.temp,
    'active': false,
    'userId': req.body.userId
  }).then(function (result) {
    res.status(200).send("Data registered successfully")
    return;
  }).catch(function (err) {
    res.status(410).header("Registration error").send("Invalid data")
    return;
  })
})

app.put("/updateUserConfig", function (req, res) {
  if (!req.query.gases && !req.query.water && !req.query.temp && !req.query.active && !req.query.userId) {
    res.status(400).header("Payload incomplete").send("Payload incomplete")
    return;
  }
  const add = database.UserConfig.update({
    'gases': req.body.gases,
    'water': req.body.water,
    'temp': req.body.temp,
    'active': req.body.active,
    'userId': req.body.userId
  },
    {
      where: { userId: req.body.userId },
    }
  ).then(function (result) {
    res.status(200).send("Data registered successfully")
    return;
  }).catch(function (err) {
    res.status(410).header("Registration error").send("Invalid data")
    return;
  })
})

app.listen(port, () => console.log(`servidor rodando na porta ${port}`));

module.exports = app;