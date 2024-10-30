import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { Map, Marker } from 'pigeon-maps';
import { Button, Card, Divider, Grid, IconButton, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { gridSpacing } from 'store/constant';
import useSidebar from 'hooks/useSidebar';
import crosswalk from 'menu-items/crosswalk';
import config from 'config';
import { useAuth } from 'react-oidc-context';
import MeasurementsCard from 'components/MeasurementsCard';
import OverviewCard from 'components/OverviewCard';
import TrafficCard from 'components/TrafficCard';
import MainCard from 'ui-component/cards/MainCard';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { io } from 'socket.io-client';
import { height } from '@mui/system';

const Overview = () => {
    const { items, setSidebar } = useSidebar();
    const theme = useTheme();
    const [map, setMap] = useState(null);
    const [poles, setPoles] = useState([]);
    const [crosswalkName, setCrosswalkName] = useState(null);
    const [sensors, setSensors] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [deviceStateColor, setDeviceStateColor] = useState('yellow');
    const auth = useAuth();
    const { state } = useLocation();

    const headers = {
        Link: `${config.contextURL}; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`,
        'NGSILD-Tenant': `${config.ngsildTenant}`,
        'X-Auth-Token': `${auth.user ? auth.user.access_token : ''}`
    };

    const handleError = (error) => {
        console.error('Error fetching data: ', error);
        setError(error);
    };

    const fetchCrosswalkName = async () => {
        try {
            const url = `${config.orionHost}/ngsi-ld/v1/entities/${state.id}?attrs=name`;
            const response = await fetch(url, { headers });

            if (response.ok) {
                const data = await response.json();
                setCrosswalkName(data.name.value);
            } else {
                throw new Error('Failed to fetch crosswalk name');
            }
        } catch (error) {
            handleError(error);
        }
    };

    const fetchMapData = async () => {
        try {
            const response = await fetch(`${config.orionHost}/ngsi-ld/v1/entities/${state.id}?attrs=location`, {
                headers
            });

            if (response.ok) {
                const data = await response.json();
                const {
                    location: {
                        value: { coordinates }
                    }
                } = data;
                setMap(
                    <Map height={339} defaultCenter={coordinates} defaultZoom={17}>
                        <Marker width={50} anchor={coordinates} />
                    </Map>
                );
            } else {
                throw new Error('Failed to fetch map data');
            }
        } catch (error) {
            handleError(error);
        }
    };

    const fetchPoles = async () => {
        try {
            const url = `${config.orionHost}/ngsi-ld/v1/entities?type=Pole&q=controlledAsset=="${state.id}"`;
            const response = await fetch(url, { headers });

            if (response.ok) {
                const data = await response.json();
                if (data.length === 2) {
                    setPoles(data);
                    const allPolesOn = data.every((pole) => pole.deviceState.value === 'ON');
                    const allPolesOff = data.every((pole) => pole.deviceState.value === 'OFF');
                    if (allPolesOn) {
                        setDeviceStateColor(theme.palette.success.dark);
                    } else if (allPolesOff) {
                        setDeviceStateColor(theme.palette.error.dark);
                    } else {
                        setDeviceStateColor(theme.palette.warning.dark);
                    }
                } else {
                    throw new Error('Failed to fetch poles');
                }
            }
        } catch (error) {
            handleError(error);
        }
    };

    const fetchSensors = async () => {
        try {
            const url = `${config.orionHost}/ngsi-ld/v1/entities?q=refDevice=="${poles[0].id}"`;
            const response = await fetch(url, { headers });

            if (response.ok) {
                const data = await response.json();
                const sensorIDs = data.filter((element) => element.id.includes('Sensor:'));
                setSensors([]);
                setSensors(sensorIDs.map((sensor) => sensor.id));
            } else {
                throw new Error('Failed to fetch sensors');
            }
        } catch (error) {
            handleError(error);
        }
    };

    const handleButtonClick = () => {
        const createPatchRequest = (url) => {
            const data = {
                type: 'Property',
                value: ''
            };

            const options = {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'NGSILD-Tenant': `${config.ngsildTenant}`,
                    'X-Auth-Token': `${auth.user ? auth.user.access_token : ''}`
                },
                body: JSON.stringify(data)
            };

            return fetch(url, options)
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Error: ' + response.status);
                })
                .then((data) => {
                    console.log(data);
                })
                .catch((error) => {
                    console.error(error);
                });
        };

        const pole1 = `${config.orionHost}/ngsi-ld/v1/entities/${poles[0].id}/attrs/${
            poles.every((pole) => pole.deviceState.value === 'OFF') ? 'on' : 'off'
        }`;

        const pole2 = `${config.orionHost}/ngsi-ld/v1/entities/${poles[1].id}/attrs/${
            poles.every((pole) => pole.deviceState.value === 'OFF') ? 'on' : 'off'
        }`;

        createPatchRequest(pole1);
        createPatchRequest(pole2);
    };

    useEffect(() => {
        fetchCrosswalkName();
        fetchMapData();
        fetchPoles();
    }, []);

    useEffect(() => {
        if (poles.length > 0) {
            fetchSensors();
            setSidebar([
                crosswalk(
                    '/crosswalk',
                    state.id,
                    crosswalkName,
                    poles.filter((pole) => pole.id.endsWith('_0')).map((pole) => pole.id)[0],
                    poles.filter((pole) => pole.id.endsWith('_1')).map((pole) => pole.id)[0]
                )
            ]);
            setLoading(false);

            const socket = io(config.backendHost, {
                path: '/backend',
                query: {
                    roomName: poles[0].id.split(':')[3]
                },
                auth: {
                    token: config.backendToken
                }
            });

            socket.on('update', (data) => {
                setTimeout(() => {
                    fetchPoles();
                    fetchSensors();
                }, 100);
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [poles]);

    useEffect(() => {}, [sensors]);

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12} my={2}>
                <Card sx={{ backgroundColor: theme.palette.primary.main }}>
                    <Typography variant="h2" align="center" py={3} color="white">
                        {crosswalkName}
                    </Typography>
                </Card>
            </Grid>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item lg={7} md={12} sm={12} xs={12}>
                        <Grid container spacing={gridSpacing}>
                            <Grid item lg={6} md={6} sm={12} xs={12}>
                                <OverviewCard isLoading={isLoading} type={'InoperativePoles'} crosswalkID={state.id} />
                            </Grid>
                            <Grid item lg={6} md={6} sm={12} xs={12}>
                                <OverviewCard isLoading={isLoading} type={'LowBatteryPoles'} crosswalkID={state.id} />
                            </Grid>
                            <Grid item lg={6} md={6} sm={12} xs={12}>
                                <OverviewCard isLoading={isLoading} type={'UnassessedImpacts'} crosswalkID={state.id} />
                            </Grid>
                            <Grid item lg={6} md={6} sm={12} xs={12}>
                                <Button fullWidth sx={{ height: '100%', padding: 0 }} onClick={handleButtonClick}>
                                    <MainCard
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: '100%',
                                            width: '100%'
                                        }}
                                    >
                                        <PowerSettingsNewIcon color="inherit" sx={{ fontSize: '7rem', color: deviceStateColor }} />
                                    </MainCard>
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item lg={5} md={12} sm={12} xs={12}>
                        <MainCard>{map}</MainCard>
                    </Grid>
                </Grid>
            </Grid>

            <Grid item xs={12}>
                <Divider sx={{ height: 3, backgroundColor: theme.palette.dark.light }} /> {/* Thick line divider */}
            </Grid>

            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item xl={4} lg={6} md={6} sm={12} xs={12}>
                        <TrafficCard
                            isLoading={isLoading}
                            variable="pedestrians"
                            variableDescription="Number of pedestrians today"
                            variableSymbol=""
                            poleContext={true}
                            pole0={poles.length > 1 ? poles[0].id : null}
                            pole1={null}
                        />
                    </Grid>
                    <Grid item xl={4} lg={6} md={6} sm={12} xs={12}>
                        <TrafficCard
                            isLoading={isLoading}
                            variable="vehicles"
                            variableDescription="Number of vehicles today"
                            variableSymbol=""
                            poleContext={false}
                            pole0={poles.length > 1 ? poles[0].id : null}
                            pole1={poles.length > 1 ? poles[1].id : null}
                        />
                    </Grid>
                    <Grid item xl={2} lg={6} md={6} sm={12} xs={12}>
                        <MeasurementsCard
                            isLoading={isLoading}
                            variable="speedMax"
                            variableDescription="Maximum vehicle speed"
                            variableSymbol="km/h"
                            sensor={sensors.find((sensor) => sensor.includes('VehicleSensor'))}
                        />
                    </Grid>
                    <Grid item xl={2} lg={6} md={6} sm={12} xs={12}>
                        <MeasurementsCard
                            isLoading={isLoading}
                            variable="averageSpeed"
                            variableDescription="Average vehicle speed"
                            variableSymbol="km/h"
                            sensor={sensors.find((sensor) => sensor.includes('VehicleSensor'))}
                        />
                    </Grid>

                    <Grid item xl={4} lg={6} md={6} sm={12} xs={12}>
                        <MeasurementsCard
                            isLoading={isLoading}
                            variable="atmosphericPressure"
                            variableDescription="Atmospheric pressure"
                            variableSymbol="HPa"
                            sensor={sensors.find((sensor) => sensor.includes('TemperatureHumidityPressureSensor'))}
                        />
                    </Grid>
                    <Grid item xl={4} lg={6} md={6} sm={12} xs={12}>
                        <MeasurementsCard
                            isLoading={isLoading}
                            variable="temperature"
                            variableDescription="Outside temperature"
                            variableSymbol="ºC"
                            sensor={sensors.find((sensor) => sensor.includes('TemperatureHumidityPressureSensor'))}
                        />
                    </Grid>
                    <Grid item xl={4} lg={6} md={6} sm={12} xs={12}>
                        <MeasurementsCard
                            isLoading={isLoading}
                            variable="relativeHumidity"
                            variableDescription="Outside humidity"
                            variableSymbol="%"
                            sensor={sensors.find((sensor) => sensor.includes('TemperatureHumidityPressureSensor'))}
                        />
                    </Grid>
                    <Grid item xl={4} lg={6} md={6} sm={12} xs={12}>
                        <MeasurementsCard
                            isLoading={isLoading}
                            variable="illuminance"
                            variableDescription="Ambient light intensity"
                            variableSymbol="lx"
                            sensor={sensors.find((sensor) => sensor.includes('BrightnessSensor'))}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Overview;
