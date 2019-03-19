const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./routes/routes')(app);

const server = app.listen(8081, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Flying low sensor service running at http://%s:%s", host, port)
});