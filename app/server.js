const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 9054;
const HOST = '0.0.0.0';

require('./routes/routes')(app);

const server = app.listen(PORT, HOST, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Flying low sensor service running at http://%s:%s", host, port)
});