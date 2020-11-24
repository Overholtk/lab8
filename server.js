'use strict';

const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;



app.use(cors());

app.get('/location', handleLocation);
app.get('/weather', handleWeather);

function handleLocation(req,res) {
  let city = req.query.city;
  let url = `http://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`
  let locations = {};

  if(locations[url]){
    res.send(locations[url]);
  } else {
    superagent.get(url)
    .then(data => {
      const geoData = data.body;
      const location = new Location(city, geoData);
      locations[url] = location;

      res.json(location);
    })
    .catch((err) => {
      console.error('error, please try again.', err)
    });
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
    let dateWeather = weatherData.data.map((value) => {
      new Forecast(value);
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