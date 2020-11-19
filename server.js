'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/location', handleLocation);
app.get('/weather', handleWeather);

function handleLocation(req,res) {
  try {
    let geoData = require('./data/location.json');
    let city = req.query.city;
    let locationData = new Location(city, geoData);
    res.send(locationData);
  } catch (error) {
    console.error(error)
  }
}

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

function handleWeather(req,res) {
  try {
    let weatherData = require('./data/weather.json');
    let dateWeather = [];
    weatherData.data.forEach((value) => {
      dateWeather.push(new Forecast(value));
    })
    res.send(dateWeather);
  } catch (error) {
    console.error(error);
  }
}

function Forecast(value) {
  this.time = value.valid_date;
  this.forecast = value.weather.description;
}

app.get('/location', (req, res) => {
  throw new Error({status: 500, responseText: 'Sorry, something went wrong' });
})


app.listen(PORT, () => {
  console.log('server up on port 3000');
});