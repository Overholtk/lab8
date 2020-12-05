'use strict';

const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const TRAIL_API_KEY = process.env.TRAIL_API_KEY;

const client = new pg.Client(process.env.DATABASE_URL);

app.use(cors());

app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/trails', handleTrails);

function handleLocation(req,res) {
  let city = req.query.city;
  let url = `http://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`
  let locations = {};

  let SQL = `SELECT * FROM locationdata WHERE search_query = '${city}';`;
  client.query(SQL)
  .then(results => {
    if(results.rows.length > 0){
      console.log('in database:', results.rows);
      res.send(results.rows[0]);
    }else{
      superagent.get(url)
      .then(data => {
        console.log('hello!');
        const geoData = data.body;
        const location = new Location(city, geoData);
        locations[url] = location;
  
        res.json(location);
  
        let cityName = city;
        let latitude = location.latitude;
        let longitude = location.longitude;
        let formatted_query = location.formatted_query;
        let values = [cityName, formatted_query, latitude, longitude];
        let SQL = `INSERT INTO locationData (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);`;
        client.query(SQL, values);
      })
    }
  })
  .catch((err) => {
    console.error('error, please try again.', err)
  });
}



function handleWeather(req,res) {
  let lat = req.query.latitude;
  let lon = req.query.longitude;
  let url = `http://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}&days=8`
  superagent.get(url)
  .then(results => {
    return results.body.data;
  })
  .then(data =>{
    return data.map(dataObject => {
      return new Forecast(dataObject);
    })
  })
  .then(forecasts =>{
    res.json(forecasts);
  })
  .catch(err => {
    console.error(err);
  });
}

function handleTrails(req,res){
  let lat = req.query.latitude;
  let lon = req.query.longitude;
  let url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxResults=10&key=${TRAIL_API_KEY}`
  superagent.get(url)
  .then(results => {
    return results.body.trails;
  })
  .then(data => {
    return data.map(trailData =>{
      return new Trail(trailData);
    })
  })
  .then(trails => {
    res.json(trails);
  })
}

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

function Forecast(value) {
  this.time = value.datetime;
  this.forecast = value.weather.description;
}

function Trail(value){
  this.name = value.name;
  this.location = value.location;
  this.length = value.length;
  this.stars = value.stars;
  this.star_votes = value.starVotes;
  this.summary = value.summary;
  this.trail_url = value.url;
  this.conditions = value.conditionDetails;
  this.condition_date = value.conditionDate;
}

app.get('/location', (req, res) => {
  throw new Error({status: 500, responseText: 'Sorry, something went wrong' });
})

client.connect()
.then(() => {
  app.listen(PORT, () => {
    console.log(`server up on port ${PORT}`);
  });
})