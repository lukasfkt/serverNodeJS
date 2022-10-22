const express = require('express');
const bodyParser = require('body-parser');
const database = require('./models');
const db = require('./models');
const { Op } = require("sequelize");
const { json } = require('body-parser');

const app = express();

app.use(bodyParser.json());

const port = 8080;

//========================================= TESTS =========================================

app.get("/test", function (req, res) {
  var date = new Date();
  date.setHours(date.getHours() - 3)
  return res.status(200).send(date);
})

app.get("/resetAllData", function (req, res) {
  db.Meditions.destroy({
    where: {},
    truncate: true
  })
  return res.status(200).send();
})

//========================================= GET MEDITIONS =========================================

app.get('/all', async function (req, res) {
  const result = await database.Meditions.findAll()
  return res.status(200).send(result);
})

app.get('/getLastMonthMed', async function (req, res) {
  if (!req.query.userId) {
    return res.status(400).header("Payload incomplete").send("Payload incomplete");
  }
  var data = new Date();
  data.setDate(0);
  data.setHours(data.getHours() - 3)
  var temp = [], water = [], gases = [];
  var aux = [[]];
  aux['temp'] = [], aux['water'] = [], aux['gases'] = []
  var timeTemp = [], timeWater = [], timeGases = [];
  const result = await database.Meditions.findAll({
    where: {
      time: {
        [Op.gte]: data,
      },
      userId: {
        [Op.eq]: req.query.userId,
      },
    }
  })
  if (result.length == 0) {
    return res.status(406).header("User not found").send("User not found");
  }
  result.forEach((element) => {
    d = new Date(element.time)
    var datestring = ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2);
    switch (element.type) {
      case "temp":
        if (timeTemp.includes(datestring)) {
          index = timeTemp.findIndex(dataToFind => dataToFind == datestring)
          temp[index] = temp[index] + element.medData
          if (!['temp'][index]) {
            aux['temp'][index] = 1;
          }
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
          if (!aux['water'][index]) {
            aux['water'][index] = 1;
          }
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
          if (!aux['gases'][index]) {
            aux['gases'][index] = 1;
          }
          aux['gases'][index] += 1;
        } else {
          gases.push(element.medData);
          timeGases.push(datestring)
        }
        break;
    }
  });
  temp.forEach((element, index) => {
    if (aux['temp'][index]) {
      temp[index] = temp[index] / aux['temp'][index]
    }
  });
  water.forEach((element, index) => {
    if (aux['water'][index]) {
      water[index] = water[index] / aux['water'][index]
    }
  });
  gases.forEach((element, index) => {
    if (aux['gases'][index]) {
      gases[index] = gases[index] / aux['gases'][index]
    }
  });
  return res.status(200).json({ temp: temp, timeTemp: timeTemp, water: water, timeWater: timeWater, gases: gases, timeGases: timeGases });
})


// SENSOR GAS, TEMPERATURA, FUMACA E FLUXO DE AGUA
app.get('/getLastHourMed', async function (req, res) {
  if (!req.query.userId) {
    return res.status(400).header("Payload incomplete").send("Payload incomplete");
  }
  var data = new Date();
  var temp = [], water = [], gases = [];
  var timeTemp = [], timeWater = [], timeGases = [];
  data.setHours(data.getHours() - 4)
  const result = await database.Meditions.findAll({
    where: {
      time: {
        [Op.gte]: data,
      },
      userId: {
        [Op.eq]: req.query.userId,
      },
    }
  })
  if (result.length == 0) {
    return res.status(406).header("User not found").send("User not found");
  }
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
  return res.status(200).json({ temp: temp, timeTemp: timeTemp, water: water, timeWater: timeWater, gases: gases, timeGases: timeGases });
})

//========================================= WRITE MEDITIONS =========================================

app.post("/sendData", function (req, res) {
  var userId = req.body.userId ? req.body.userId : req.query.userId
  var type = req.body.type ? req.body.type : req.query.type
  var medData = req.body.medData ? req.body.medData : req.query.medData
  var timestamp = req.body.timestamp ? req.body.timestamp : req.query.timestamp
  var date = new Date(timestamp * 1000);
  date.setHours(date.getHours() - 3)
  if (!userId || !type || !medData || !timestamp) {
    return res.status(400).header("Payload incomplete").send("Payload incomplete");
  }
  if (type != "temp" && type != "water" && type != "gases") {
    return res.status(410).header("Registration error").send("Invalid data");
  }
  database.Meditions.create({
    'type': req.body.type,
    'medData': req.body.medData,
    'time': date,
    'userId': req.body.userId,
  }).then(function (result) {
    return res.status(201).send("Data registered successfully");
  }).catch(function (err) {
    return res.status(401).send("Failed to register data" + err);
  })
})

//========================================= MEASURE CONFIGS =======================================

app.get('/measure', async function (req, res) {
  var userId = req.body.userId ? req.body.userId : req.query.userId
  if (!userId) {
    return res.status(400).header("Payload incomplete").send("Payload incomplete");
  }

  const result = await database.MeasureConfigs.findOne({
    where: {
      userId: {
        [Op.eq]: req.query.userId,
      },
    }
  })

  const valueToReturn = {
    "timeToMeasure": result.timeToMeasure,
    "supervisor_configs": {
      "time_to_supervisor": result.timeToSup,
      "supervisor_gas_thresholds": {
        "activate_threshold": result.supGasActivateThreshold,
        "deactivate_threshold": result.supGasDeactivateThreshold
      },
      "supervisor_temp_thresholds": {
        "activate_threshold": result.supTempActivateThreshold,
        "deactivate_threshold": result.supTempDeactivateThreshold
      },
      "supervisor_water_thresholds": {
        "activate_threshold": result.supWaterActivateThreshold,
        "deactivate_threshold": result.supWaterDeactivateThreshold
      }
    }
  }
  return res.json(valueToReturn).status(200);
});

app.post('/measure', async function (req, res) {
  const { userId, time_to_measure, supervisor_configs, } = req.body;
  const { time_to_supervisor, supervisor_gas_thresholds, supervisor_temp_thresholds, supervisor_water_thresholds } = supervisor_configs;

  if (!userId, !time_to_measure || !supervisor_configs || !time_to_supervisor || !supervisor_gas_thresholds || !supervisor_temp_thresholds) {
    return res.status(400).header("Payload incomplete").send("Payload incomplete");
  }

  const result = await database.MeasureConfigs.findOne({
    where: {
      userId: {
        [Op.eq]: userId,
      },
    }
  })

  if (result.length == 0) {
    database.MeasureConfigs.create({
      'timeToMeasure': time_to_measure,
      'timeToSup': time_to_supervisor,
      'supGasActivateThreshold': supervisor_gas_thresholds.activate_threshold,
      'supGasDeactivateThreshold': supervisor_gas_thresholds.deactivate_threshold,
      'supTempActivateThreshold': supervisor_temp_thresholds.activate_threshold,
      'supTempDeactivateThreshold': supervisor_temp_thresholds.deactivate_threshold,
      'supWaterActivateThreshold': supervisor_water_thresholds.activate_threshold,
      'supWaterDeactivateThreshold': supervisor_water_thresholds.deactivate_threshold,
      'userId': userId,
    }).then(function (result) {
      return res.status(201).send("Data registered successfully");
    }).catch(function (err) {
      return res.status(401).send("Failed to register data" + err);
    })
  } else {
    database.MeasureConfigs.update({
      'timeToMeasure': time_to_measure,
      'timeToSup': time_to_supervisor,
      'supGasActivateThreshold': supervisor_gas_thresholds.activate_threshold,
      'supGasDeactivateThreshold': supervisor_gas_thresholds.deactivate_threshold,
      'supTempActivateThreshold': supervisor_temp_thresholds.activate_threshold,
      'supTempDeactivateThreshold': supervisor_temp_thresholds.deactivate_threshold,
      'supWaterActivateThreshold': supervisor_water_thresholds.activate_threshold,
      'supWaterDeactivateThreshold': supervisor_water_thresholds.deactivate_threshold,
    },
      {
        where: { userId: userId },
      }
    ).then(function (result) {
      return res.status(201).send("Data alterado com sucesso");
    }).catch(function (err) {
      return res.status(401).send("Failed to register data" + err);
    })
  }
});

//========================================= ALERT CONFIGS =========================================
app.get('/alert', async function (req, res) {
  var userId = req.body.userId ? req.body.userId : req.query.userId
  if (!userId) {
    return res.status(400).header("Payload incomplete").send("Payload incomplete");
  }

  const result = await database.AlertConfigs.findOne({
    where: {
      userId: {
        [Op.eq]: req.query.userId,
      },
    }
  })

  const valueToReturn = {
    "alert_gas_enable": result.alertGasEnable,
    "alert_temp_enable": result.alertTempEnable,
    "alert_water_enable": result.alertWaterEnable,
    "set_alert_configs": {
      "alert_gas_thresholds": {
        "activate_threshold": result.gasActivateThreshold,
        "deactivate_threshold": result.gasDeactivateThreshold
      },
      "alert_temp_thresholds": {
        "activate_threshold": result.tempActivateThreshold,
        "deactivate_threshold": result.tempDeactivateThreshold
      },
      "alert_water_thresholds": {
        "activate_threshold": result.waterActivateThreshold,
        "deactivate_threshold": result.waterDeactivateThreshold
      }
    }
  }
  return res.json(valueToReturn).status(200);

});

app.post('/alert', async function (req, res) {
  const { userId, alert_gas_enable, alert_temp_enable, alert_water_enable, set_alert_configs } = req.body;
  const { alert_gas_thresholds, alert_temp_thresholds, alert_water_thresholds } = set_alert_configs;

  if (!userId || !alert_gas_enable || !alert_temp_enable || !alert_water_enable || !set_alert_configs || !alert_gas_thresholds || !alert_temp_thresholds || !alert_water_thresholds) {
    return res.status(400).header("Payload incomplete").send("Payload incomplete");
  }

  const result = await database.AlertConfigs.findOne({
    where: {
      userId: {
        [Op.eq]: userId,
      },
    }
  })

  if (result.length == 0) {
    database.AlertConfigs.create({
      'alertGasEnable': alert_gas_enable,
      'alertWaterEnable': alert_water_enable,
      'alertTempEnable': alert_temp_enable,
      'gasActivateThreshold': alert_gas_thresholds.activate_threshold,
      'gasDeactivateThreshold': alert_gas_thresholds.deactivate_threshold,
      'tempActivateThreshold': alert_temp_thresholds.activate_threshold,
      'tempDeactivateThreshold': alert_temp_thresholds.deactivate_threshold,
      'waterActivateThreshold': alert_water_thresholds.activate_threshold,
      'waterDeactivateThreshold': alert_water_thresholds.deactivate_threshold,
      'userId': userId
    }).then(function (result) {
      return res.status(201).send("Data registered successfully");
    }).catch(function (err) {
      return res.status(401).send("Failed to register data" + err);
    });
  } else {
    database.AlertConfigs.update({
      'alertGasEnable': alert_gas_enable,
      'alertWaterEnable': alert_water_enable,
      'alertTempEnable': alert_temp_enable,
      'gasActivateThreshold': alert_gas_thresholds.activate_threshold,
      'gasDeactivateThreshold': alert_gas_thresholds.deactivate_threshold,
      'tempActivateThreshold': alert_temp_thresholds.activate_threshold,
      'tempDeactivateThreshold': alert_temp_thresholds.deactivate_threshold,
      'waterActivateThreshold': alert_water_thresholds.activate_threshold,
      'waterDeactivateThreshold': alert_water_thresholds.deactivate_threshold,
    },
      {
        where: { userId: userId },
      }
    ).then(function (result) {
      return res.status(201).send("Data registered successfully");
    }).catch(function (err) {
      return res.status(401).send("Failed to register data" + err);
    })
  }
});


app.listen(port, () => console.log(`servidor rodando na porta ${port}`));

module.exports = app;