'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.get('/', (request,response) => {
  response.send('homepage!');
});



app.listen(PORT, () => {
  console.log('server up on port 3000');
});