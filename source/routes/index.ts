/**
 * Station routes
 */

import express from 'express';
import fetch from 'node-fetch';
import config from '../config/config';
import { generateStation, getStationAndWeatherData, getStationAndWeatherDataByKioskId } from '../controllers/station';
import authenticateToken from '../services/auth';
import { RIDEINDEGO_URL, GET_WEATHER_URL } from '../utils/enums';

const router = express.Router();

router.post('/indego-data-fetch-and-store-it-db', authenticateToken, async (req, res) => {
    try {
        let response = await fetch(`${RIDEINDEGO_URL}`);
        let responseJSON = await response.json();
        let data = await generateStation(responseJSON);
        if (data) {
            return res.status(200).json({
                status: 200,
                data: data,
                error: null
            });
        }
    } catch (err) {
        // catches errors both in fetch and response.json
        return res.status(400).json({
            status: 400,
            data: null,
            error: err.message
        });
    }
});

router.get('/stations/:at', authenticateToken, async (req, res) => {
    console.log("/stations/:at", req.params.at);
    try {
        let response = await fetch(`${GET_WEATHER_URL}=Philadelphia&appid=${config.auth.API_KEY}`);
        let responseJSON = await response.json();
        console.log('responseJSON >>', responseJSON);
        let data = await getStationAndWeatherData(req.params.at);
        if (data) {
            let obj = {
                at: req.params.at,
                weather: responseJSON,
                station: data
            };
            return res.status(200).json({
                status: 200,
                data: obj,
                error: null
            });
        }
    } catch (err) {
        // catches errors both in fetch and response.json
        console.log("error >", err);
        return res.status(400).json({
            status: 400,
            data: null,
            error: err
        });
    }
});

router.get('/stations/:kioskId/:at', authenticateToken, async (req, res) => {
    try {
        fetch(`${GET_WEATHER_URL}=Philadelphia&appid=${config.auth.API_KEY}`)
            .then((res) => res.json())
            .catch(function (error) {
                return res.status(400).json({
                    status: 400,
                    data: null,
                    error: error.message
                });
            })
            .then(async function (response) {
                let data = await getStationAndWeatherDataByKioskId(req.params.kioskId, req.params.at);
                let obj = {
                    at: req.params.at,
                    weather: response,
                    station: data
                };
                if (data) {
                    return res.status(200).json({
                        status: 200,
                        data: obj,
                        error: null
                    });
                }
            });
    } catch (err) {
        return res.status(400).json({
            status: 400,
            data: null,
            error: err
        });
    }
});

export = router;
