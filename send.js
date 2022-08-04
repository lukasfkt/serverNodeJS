var admin = require("firebase-admin");

var serviceAccount = require("./smarthousenodejs-firebase-adminsdk-6rrct-8819e39c83.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports.admin = admin