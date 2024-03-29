const express = require('express');
const bodyParser = require('body-parser');
const database = require('./models');
const db = require('./models');
const { Op } = require("sequelize");
const { json } = require('body-parser');
var nodemailer = require('nodemailer');

const app = express();

app.use(bodyParser.json());

const port = 8080;

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'noreply.appsmarthouse@gmail.com',
    pass: 'ildpcwzxuvxwzxwj'
  }
});

var mailOptions = {
  from: 'noreply.appsmarthouse@gmail.com',
  to: 'gabrielganzert@alunos.utfpr.edu.br, lucastanaka@alunos.utfpr.edu.br',
  subject: 'Novo alerta',
  text: 'Novo alerta disparado, porfavor verifique o seu aplicativo'
};

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
  const { result } = await database.Meditions.findAll()
  return res.status(200).send(result);
})

app.get('/getLastMonthMed', async function (req, res) {
  if (!req.query.userId) {
    return res.status(400).header("Payload incomplete").send("Payload incomplete");
  }
  var dataMin = new Date();
  var dataMax = new Date();
  dataMax.setMonth(dataMax.getMonth() + 1);
  dataMax.setHours(dataMax.getHours() - 3);
  dataMax.setDate(0);
  dataMin.setDate(0);
  dataMin.setHours(dataMin.getHours() - 3)
  var temp = [], water = [], gases = [];
  var aux = [[]];
  aux['temp'] = [], aux['water'] = [], aux['gases'] = []
  var timeTemp = [], timeWater = [], timeGases = [];
  const result = await database.Meditions.findAll({
    where: {
      time: {
        [Op.between]: [dataMin, dataMax]
      },
      userId: {
        [Op.eq]: req.query.userId,
      },
    }
  })
  if (result.length == 0) {
    return res.status(206).header("User not found").json({ temp: [0], timeTemp: [0], water: [0], timeWater: [0], gases: [0], timeGases: [0] });
  }
  result.forEach((element) => {
    d = new Date(element.time)
    var datestring = ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2);
    switch (element.type) {
      case "TEMP":
        if (timeTemp.includes(datestring)) {
          index = timeTemp.findIndex(dataToFind => dataToFind == datestring)
          temp[index] = temp[index] + element.medData
          if (!aux['temp'][index]) {
            aux['temp'][index] = 1;
          }
          aux['temp'][index] += 1;
        } else {
          temp.push(element.medData);
          timeTemp.push(datestring)
        }
        break;
      case "WATER_VOLUME":
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
      case "GAS":
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
  var dataMax = new Date();
  var dataMin = new Date();
  var temp = [], water = [], gases = [];
  var timeTemp = [], timeWater = [], timeGases = [];
  dataMax.setHours(dataMax.getHours() - 3)
  dataMin.setHours(dataMin.getHours() - 4)
  const result = await database.Meditions.findAll({
    where: {
      time: {
        [Op.between]: [dataMin, dataMax]
      },
      userId: {
        [Op.eq]: req.query.userId,
      },
    }
  })
  if (result.length == 0) {
    return res.status(206).header("User not found").json({ temp: [0], timeTemp: [0], water: [0], timeWater: [0], gases: [0], timeGases: [0] });
  }
  result.forEach(element => {
    d = new Date(element.time)
    var datestring = (("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2));
    switch (element.type) {
      case "TEMP":
        temp.push(element.medData);
        timeTemp.push(datestring)
        break;
      case "WATER_VOLUME":
        water.push(element.medData);
        timeWater.push(datestring)
        break;
      case "GAS":
        gases.push(element.medData);
        timeGases.push(datestring)
        break;
    }
  });
  return res.status(200).json({ temp: temp, timeTemp: timeTemp, water: water, timeWater: timeWater, gases: gases, timeGases: timeGases });
})

//========================================= WRITE MEDITIONS =========================================

app.post("/sendData", function (req, res) {
  const { userId, measurementsGroup } = req.body;
  const { timestamp, measurements } = measurementsGroup
  console.log(timestamp);
  measurements.forEach((measure) => {
    const { type, value } = measure;
    var date = new Date(timestamp * 1000);
    date.setHours(date.getHours() - 3)
    if (!userId || !type || !timestamp) {
      return res.status(400).header("Payload incomplete").send("Payload incomplete");
    }
    if (type != "TEMP" && type != "WATER_VOLUME" && type != "GAS") {
      return res.status(410).header("Registration error").send("Invalid data");
    }
    database.Meditions.create({
      'type': type,
      'medData': value,
      'time': date,
      'userId': userId,
    }).catch(function (err) {
      return res.status(401).send("Failed to register data" + err);
    })
  })
  return res.status(201).send("Data registered successfully");
})

//========================================= CONFIGS =======================================

app.get('/configs', async function (req, res) {
  var userId = req.body.userId ? req.body.userId : req.query.userId
  if (!userId) {
    return res.status(400).header("Payload incomplete").send("Payload incomplete");
  }

  const resultMeasure = await database.MeasureConfigs.findOne({
    where: {
      userId: {
        [Op.eq]: req.query.userId,
      },
    }
  })

  const resultAlert = await database.AlertConfigs.findOne({
    where: {
      userId: {
        [Op.eq]: req.query.userId,
      },
    }
  })

  if (!resultMeasure || !resultAlert) {
    return res.status(406).header("User not found").send("User not found");
  }

  const unixTimeStamp = Math.floor(Date.now() / 1000);

  const valueToReturn = {
    "timestamp": unixTimeStamp,
    "measure_configs": {
      "time_to_measure": resultMeasure.timeToMeasure,
      "supervisor_configs": {
        "time_to_supervisor": resultMeasure.timeToSup,
        "supervisor_gas_thresholds": {
          "activate_threshold": resultMeasure.supGasActivateThreshold,
          "deactivate_threshold": resultMeasure.supGasDeactivateThreshold
        },
        "supervisor_temp_thresholds": {
          "activate_threshold": resultMeasure.supTempActivateThreshold,
          "deactivate_threshold": resultMeasure.supTempDeactivateThreshold
        },
        'supervisor_enable': resultMeasure.supEnable,
        'supervisor_percentage': resultMeasure.percentage
      },
    },
    "alert_configs": {
      "alert_gas_enable": resultAlert.alertGasEnable,
      "alert_temp_enable": resultAlert.alertTempEnable,
      "alert_water_enable": resultAlert.alertWaterEnable,
      "set_alert_configs": {
        "alert_gas_thresholds": {
          "activate_threshold": resultAlert.gasActivateThreshold,
          "deactivate_threshold": resultAlert.gasDeactivateThreshold
        },
        "alert_temp_thresholds": {
          "activate_threshold": resultAlert.tempActivateThreshold,
          "deactivate_threshold": resultAlert.tempDeactivateThreshold
        },
        "alert_water_thresholds": {
          "activate_threshold": resultAlert.waterActivateThreshold,
          "deactivate_threshold": resultAlert.waterDeactivateThreshold
        }
      }
    }
  }
  return res.json(valueToReturn).status(200);
});

//========================================= MEASURE CONFIGS =======================================

app.get('/measurement_configs', async function (req, res) {
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

  if (!result) {
    return res.status(406).header("User not found").send("User not found");
  }

  const unixTimeStamp = Math.floor(Date.now() / 1000);

  const valueToReturn = {
    "time_to_measure": result.timeToMeasure,
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
      'supervisor_enable': result.supEnable,
      'supervisor_percentage': result.percentage
    },
    "timestamp": unixTimeStamp
  }
  return res.json(valueToReturn).status(200);
});

app.post('/measurement_configs', async function (req, res) {
  const { userId, time_to_measure, supervisor_configs } = req.body;
  const { time_to_supervisor, supervisor_gas_thresholds, supervisor_temp_thresholds, supervisor_enable, supervisor_percentage } = supervisor_configs;

  if (!userId || !time_to_measure || !supervisor_configs || !time_to_supervisor || !supervisor_gas_thresholds || !supervisor_temp_thresholds) {
    return res.status(400).header("Payload incomplete").send("Payload incomplete");
  }

  const sup_percentage = supervisor_percentage ? supervisor_percentage : 0.9;
  const sup_enable = supervisor_enable ? supervisor_enable : true;

  const result = await database.MeasureConfigs.findOne({
    where: {
      userId: {
        [Op.eq]: userId,
      },
    }
  })

  if (!result) {
    database.MeasureConfigs.create({
      'timeToMeasure': time_to_measure,
      'timeToSup': time_to_supervisor,
      'supGasActivateThreshold': supervisor_gas_thresholds.activate_threshold,
      'supGasDeactivateThreshold': supervisor_gas_thresholds.deactivate_threshold,
      'supTempActivateThreshold': supervisor_temp_thresholds.activate_threshold,
      'supTempDeactivateThreshold': supervisor_temp_thresholds.deactivate_threshold,
      'supEnable': sup_enable,
      'percentage': sup_percentage,
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
      'supEnable': sup_enable,
      'percentage': sup_percentage,
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
app.get('/alert_configs', async function (req, res) {
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

  if (!result) {
    return res.status(406).header("User not found").send("User not found");
  }

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

app.post('/alert_configs', async function (req, res) {
  const { userId, alert_gas_enable, alert_temp_enable, alert_water_enable, set_alert_configs } = req.body;
  const { alert_gas_thresholds, alert_temp_thresholds, alert_water_thresholds } = set_alert_configs;

  if (!userId || !set_alert_configs || !alert_gas_thresholds || !alert_temp_thresholds || !alert_water_thresholds) {
    return res.status(400).header("Payload incomplete").send("Payload incomplete");
  }

  const result = await database.AlertConfigs.findOne({
    where: {
      userId: {
        [Op.eq]: userId,
      },
    }
  })

  if (!result) {
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

app.put('/updateUserConfig', async function (req, res) {
  const { userId, alert_gas_enable, alert_temp_enable, alert_water_enable, time_to_measure, s_enable, percent_s_t, gas_t_a, gas_t_d, temp_t_a, temp_t_d, water_t_a, water_t_d } = req.body;

  if (!userId || !time_to_measure || !percent_s_t || !gas_t_a || !gas_t_d || !temp_t_a || !temp_t_d || !water_t_a || !water_t_d) {
    return res.status(400).header("Payload incomplete").send("Payload incomplete");
  }

  await database.AlertConfigs.update({
    'alertGasEnable': alert_gas_enable,
    'alertWaterEnable': alert_water_enable,
    'alertTempEnable': alert_temp_enable,
    'gasActivateThreshold': gas_t_a,
    'gasDeactivateThreshold': gas_t_d,
    'tempActivateThreshold': temp_t_a,
    'tempDeactivateThreshold': temp_t_d,
    'waterActivateThreshold': water_t_a,
    'waterDeactivateThreshold': water_t_d,
  },
    {
      where: { userId: userId },
    }
  )

  await database.MeasureConfigs.update({
    'timeToMeasure': time_to_measure,
    'timeToSup': time_to_measure * 60 / 30,
    'supGasActivateThreshold': gas_t_a * percent_s_t,
    'supGasDeactivateThreshold': gas_t_d * percent_s_t,
    'supTempActivateThreshold': temp_t_a * percent_s_t,
    'supTempDeactivateThreshold': temp_t_d * percent_s_t,
    'supEnable': s_enable,
    'percentage': percent_s_t
  },
    {
      where: { userId: userId },
    }
  )
  return res.status(201).send();
})

//========================================= ALERTS =========================================

app.post('/alerts', async function (req, res) {
  const { userId, alerts } = req.body;
  alerts.forEach(async (element, index) => {
    const { type, active, init_timestamp, end_timestamp } = element;

    const result = await database.Alerts.findOne({
      where: {
        type: {
          [Op.eq]: type,
        },
      }
    })

    if (!result) {
      database.Alerts.create({
        'userId': userId,
        'type': type,
        'active': active,
        'init_timestamp': init_timestamp,
        'end_timestamp': end_timestamp,
      })
    } else {
      database.Alerts.update({
        'type': type,
        'active': active,
        'init_timestamp': init_timestamp,
        'end_timestamp': end_timestamp,
      },
        {
          where: { userId: userId, type: type },
        }
      );
    }
  });
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  return res.status(201).send();
});

app.get('/alerts', async function (req, res) {
  var userId = req.body.userId ? req.body.userId : req.query.userId;
  var alerts = [];
  if (!userId) {
    return res.status(400).header("Payload incomplete").send("Payload incomplete");
  }

  const result = await database.Alerts.findAll({
    where: {
      userId: {
        [Op.eq]: req.query.userId,
      },
    }
  })

  result.forEach((element, index) => {
    const { type, active, init_timestamp, end_timestamp } = element;
    const valueToInsert = {
      type,
      active,
      init_timestamp,
      end_timestamp
    };
    alerts.push(valueToInsert);
  })
  var valueToReturn = {
    userId,
    alerts
  };
  return res.json(valueToReturn).status(200);
});

app.get("/blabla", (req, res) => {
  db.Alerts.destroy({
    where: {
      type: {
        [Op.eq]: "WATER_FLOW_ALERT",
      },
    },
    truncate: true
  })
})

app.listen(port, () => console.log(`servidor rodando na porta ${port}`));

module.exports = app;