import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Combobox from "react-widgets/Combobox";
import "react-widgets/styles.css";
import "./App.css";
// const stopsAPI = "http://localhost:5000/api/bus_stops";
// const routesAPI = "http://localhost:5000/api/bus_routes";
// const timesAPI = "http://localhost:5000/api/bus_times";
// const tripsAPI = "http://localhost:5000/api/bus_trips";
const API_LINK = process.env.REACT_APP_API;
const stopsAPI = `${API_LINK}/api/bus_stops`;
const routesAPI = `${API_LINK}/api/bus_routes`;
const timesAPI = `${API_LINK}/api/bus_times`;
const tripsAPI = `${API_LINK}/api/bus_trips`;
function App() {
    const [stops, setStops] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [times, setTimes] = useState([]);
    const [trips, setTrips] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const fetchData = async () => {
        const getStopsInfo = await axios.get(stopsAPI);
        const getRoutesInfo = await axios.get(routesAPI);
        const getTimesInfo = await axios.get(timesAPI);
        const getTripsInfo = await axios.get(tripsAPI);
        axios
            .all([getStopsInfo, getRoutesInfo, getTimesInfo, getTripsInfo])
            .then(
                axios.spread((...allData) => {
                    const stopsData = allData[0].data.bus_stops;
                    const routesData = allData[1].data.bus_routes;
                    const timesData = allData[2].data.bus_times;
                    const tripsData = allData[3].data.bus_trips;

                    setStops(stopsData);
                    setRoutes(routesData);
                    setTimes(timesData);
                    setTrips(tripsData);
                })
            );
        setLoaded(true);
    };
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchData();
        } else {
            getUserLocation();
            // Your useEffect code here to be run on update
        }
    });
    let stop_areas = []; // array to fill first combobox
    let stop_names = []; // array to fill second combobox
    stops.map((stop) => {
        if (!stop_areas.includes(stop.stop_area) && !stop.stop_area == "")
            stop_areas.push(stop.stop_area);
    });
    const [selectedRegion, selectRegionCombo] = useState();
    const [stopNames, setStopNames] = useState();
    const selectRegion = (region) => {
        selectRegionCombo(region);
        stops.map((stop) => {
            if (stop.stop_area == region)
                stop_names.push(`${stop.stop_name} (${stop.stop_code})`);
        });
        setStopNames(stop_names.sort());
    };
    const [useGEO, setUseGEO] = useState("false"); // bool
    const [userRegion, setUserRegion] = useState("undefined");
    const [closestStop, setClosestStop] = useState("undefined");
    let distances = [];
    const getUserLocation = async () => {
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                // Successfully got location //
                const userLocation = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
                // getClosestStop
                stops.map((stop) => {
                    if (
                        String(stop.stop_lat).slice(0, 3) ==
                            String(userLocation.lat).slice(0, 3) &&
                        String(stop.stop_lon).slice(0, 5) ==
                            String(userLocation.lng).slice(0, 5)
                    ) {
                        if (stop.stop_area != null) {
                            setUserRegion(stop.stop_area);
                        }
                    }
                    if (stop.stop_area == userRegion) {
                        const distance = Math.sqrt(
                            (userLocation.lat - stop.stop_lat) ** 2 +
                                (userLocation.lng - stop.stop_lon) ** 2
                        );
                        distances.push(distance);
                        distances.sort();
                        if (distances[0] == distance) {
                            setClosestStop(
                                `${stop.stop_name} (${stop.stop_code})`
                            );
                        }
                    }
                });
                // bool and text changes
                setUseGEO(true);
                const userRegionText = document.querySelector("#userRegion");
                userRegionText.innerHTML = ` ${userRegion}`;
                const closestStopText =
                    document.querySelector("#userClosestStop");
                closestStopText.innerHTML = ` ${closestStop}`;
            },
            () => {
                // Location prompt is declined //
                setUseGEO(false); // Set bool to false *used in render*
            }
        );
    };
    const [shortNames, setShortNames] = useState([]);
    const handleConfirm = () => {
        const selectedStop = document.getElementsByName("stopNames")[0].value;
        let stop_code_si = selectedStop.indexOf("(") + 1;
        let stop_code_ei = selectedStop.indexOf(")");
        let stop_ids = [];
        let trip_ids = [];
        let route_ids = [];
        let short_names = [];
        const stop_name = selectedStop.slice(0, stop_code_si - 2);
        stops.forEach((stop) => {
            if (stop.stop_name == stop_name) {
                stop_ids.push(stop.stop_id);
            }
        });
        console.log(stop_ids);
        times.forEach((time) => {
            stop_ids.forEach((stop_id) => {
                if (time.stop_id == stop_id) {
                    trip_ids.push(time.trip_id);
                }
            });
        });
        console.log(trip_ids);
        trips.forEach((trip) => {
            trip_ids.forEach((trip_id) => {
                if (trip.trip_id == trip_id) {
                    route_ids.push(trip.route_id);
                }
            });
        });
        console.log(route_ids);
        routes.forEach((route) => {
            route_ids.forEach((route_id) => {
                if (route.route_id == route_id) {
                    if (!short_names.includes(route.route_short_name))
                        short_names.push(route.route_short_name);
                    short_names.sort();
                }
            });
        });
        setShortNames(short_names);
        let selectedRadioValue = document.querySelector(
            'input[name="option"]:checked'
        ).value;
        if (selectedRadioValue == "time") {
            console.log("Selected: Check the departure schedule");
        }
        if (selectedRadioValue == "route") {
            console.log("Selected: Look for direct route");
        }
        // CODE
        console.log(shortNames);
        const bus_ids = document.querySelector(".bus_ids");
        while (bus_ids.lastElementChild) {
            bus_ids.removeChild(bus_ids.lastElementChild);
        }
        shortNames.map((name) => {
            const id_elem = document.createElement("button");
            id_elem.className = "busButton";
            id_elem.key = name;
            id_elem.innerHTML = name;
            bus_ids.appendChild(id_elem);
        });
    };
    // WEB PAGE RENDER
    return (
        <div className="App">
            <div className="spacergrid grid"></div>
            {useGEO && loaded ? (
                <div className="combobox-widgets">
                    <div className="widget-one">
                        <Combobox
                            name="regionCombo"
                            placeholder="Select region"
                            data={stop_areas.sort()}
                            autoSelectMatches
                            onToggle={(selectedRegion) =>
                                selectRegion(selectedRegion)
                            }
                            onSelect={(selectedRegion) =>
                                selectRegion(selectedRegion)
                            }
                        />
                    </div>
                    <div className="widget-two">
                        <Combobox
                            name="stopNames"
                            data={stopNames}
                            placeholder="Select stop"
                            autoSelectMatches
                        />
                        <button onClick={handleConfirm} className="submit">
                            Confirm
                        </button>
                    </div>
                    <div className="radio-buttons">
                        <input
                            className="radio-btn"
                            type="radio"
                            value="time"
                            name="option"
                            defaultChecked
                        />{" "}
                        Check the departure schedule
                        <br></br>
                        <input
                            className="radio-btn"
                            type="radio"
                            value="route"
                            name="option"
                        />{" "}
                        Look for direct route
                    </div>
                    <div className="userLocationDiv">
                        Your current region is:
                        <span id="userRegion"></span>
                        <br />
                        Closest stop to you is:
                        <span id="userClosestStop"></span>
                    </div>
                    <div className="avialableBusses">
                        <br></br>
                        Avialable Busses:
                        <div className="bus_ids"></div>
                    </div>
                </div>
            ) : (
                <div className="notGrantedDiv">
                    {loaded ? <></> : <h1>Loading...</h1>}
                    {useGEO ? (
                        <></>
                    ) : (
                        <h1 className="notGranted">
                            You have to grant access to use location!
                        </h1>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
