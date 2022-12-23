const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
var cors = require('cors');
app.use(cors())

const db = new sqlite3.Database('./busstops.db', (err)=>{
  if (err) return console.error(err.message);
  console.log("Established connection to DB");
})
let bus_stops = []
let bus_times = []
let bus_routes = []
let bus_trips = []
db.each(`select * from bus_stops`, (err, row)=> {
  if (err) throw err;
  bus_stops.push(row)
})
db.each(`select * from bus_times`, (err, row)=> {
  if (err) throw err;
  bus_times.push(row)
})
db.each(`select * from bus_routes`, (err, row)=> {
  if (err) throw err;
  bus_routes.push(row)
})
db.each(`select * from bus_trips`, (err, row)=> {
  if (err) throw err;
  bus_trips.push(row)
})

app.get("/api/bus_stops", (req,res)=>{
  // res.set('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.send({
      bus_stops
    })
})
app.get("/api/bus_trips", (req,res)=>{
  // res.set('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.send({
      bus_trips
    })
})
app.get("/api/bus_routes", (req,res)=>{
  // res.set('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.send({
      bus_routes
    })
})
app.get("/api/bus_times", (req,res)=>{
  // res.set('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.send({
      bus_times
    })
})

app.listen(5000, ()=> {console.log('Server started on port 5000')})