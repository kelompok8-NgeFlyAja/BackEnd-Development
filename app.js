const express = require('express')
const errorHandler = require('./src/middlewares/errorHandler');
const app = express()
const PORT = 3000

app.get('/', (req, res) => {
    res.send("Ello Mate")
})

app.use(errorHandler);

app.listen (PORT, () => {
    console.log(`-> Listening on PORT: ${PORT}`);
})