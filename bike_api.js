const path = require('path');
const express = require('express');
const { createBikeModule } = require('./bike_module');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.static(path.join(__dirname, '..', 'page')));

if (require.main === module) {
  const port = process.env.PORT || 3001;
  const options = {
    dbHost: process.env.BIKE_MODULE_DB_HOST || '127.0.0.1',
    dbUser: process.env.BIKE_MODULE_DB_USER || 'root',
    dbPassword: process.env.BIKE_MODULE_DB_PASS || '123456',
    dbName: process.env.BIKE_MODULE_DB_NAME || 'campus_service',
  };

  app.use('/', createBikeModule(options));

  app.listen(port, () => {
    console.log(`campus bike server started at http://127.0.0.1:${port}/bike/index.html`);
    console.log(`API endpoint: http://127.0.0.1:${port}/api/bike_api.js`);
  });
}

module.exports = { createBikeModule };
