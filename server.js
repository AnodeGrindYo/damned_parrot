// server.js
const app = require('./app');  
const port = 5050;
const opn = require('opn');


app.listen(port, function() {  
    console.log('serveur en écoute sur le port' + port);
    opn("http://localhost:5050");
});