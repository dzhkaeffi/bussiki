import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Combobox from "react-widgets/Combobox";
import "react-widgets/styles.css";
// const proxy = 'http://localhost:5000'

const stopsAPI = 'http://localhost:5000/api/bus_stops'
const routesAPI = 'http://localhost:5000/api/bus_routes'
const timesAPI = 'http://localhost:5000/api/bus_times'
const tripsAPI = 'http://localhost:5000/api/bus_trips'
function App() {
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([])
  const fetchData = () => {
    const getStopsInfo = axios.get(stopsAPI)
    const getRoutesInfo = axios.get(routesAPI)
    axios.all([getStopsInfo, getRoutesInfo])
    .then(
      axios.spread((...allData) => {
        const stopsData = allData[0].data.bus_stops
        const routesData = allData[1].data.bus_routes

        // console.log(stopsDate)
        // console.log(routesData)
        setStops(stopsData)
        setRoutes(routesData)
      })
    )
  }
  useEffect(()=>{
    fetchData();
  }, [])
  let stop_areas = []
  stops.map((stop)=>{
    if (!stop_areas.includes(stop.stop_area))stop_areas.push(stop.stop_area)
  })
  const [selectedRegion, selectRegion] = useState()
  return (
    <div>
      <Combobox
        id='regionCombo'
        data={stop_areas}
        placeholder="Select region"
        autoSelectMatches
        onSelect={selectedRegion => selectRegion(selectedRegion)}
      />
      <p>{selectedRegion}</p>
    </div>
  )
}

export default App