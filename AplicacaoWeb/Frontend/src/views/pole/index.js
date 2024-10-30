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
import TrafficCard from 'components/TrafficCard';
import OverviewCard from 'components/OverviewCard';
import MainCard from 'ui-component/cards/MainCard';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { io } from 'socket.io-client';
import LightIcon from '@mui/icons-material/Light';

const Pole = () => {
    const { items, setSidebar } = useSidebar();
    const theme = useTheme();
    const [map, setMap] = useState(null);
    const [poles, setPoles] = useState(null);
    const [crosswalkName, setCrosswalkName] = useState(null);
    const [batteryModelID, setBatteryModelID] = useState(null);
    const [battery, setBattery] = useState(null);
    const [sensors, setSensors] = useState([]);
    const [luminaire, setLuminaire] = useState(null);
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

    const fetchDevices = async () => {
        try {
            const url = `${config.orionHost}/ngsi-ld/v1/entities?q=refDevice=="${state.idPole}"`;
            const response = await fetch(url, { headers });

            if (response.ok) {
                const data = await response.json();
                setSensors([]);
                setLuminaire(null);
                setSensors(data.filter((element) => element.id.includes('Sensor:')).map((element) => element.id));
                setLuminaire(data.find((element) => element.id.includes(':Luminaire:')));
            } else {
                throw new Error('Failed to fetch sensors');
            }
        } catch (error) {
            handleError(error);
        }
    };

    const fetchBattery = async () => {
        try {
            const url = `${config.orionHost}/ngsi-ld/v1/entities?type=BatteryMeasurement&q=refStorageBatteryDevice=="${batteryModelID}"`;
            const response = await fetch(url, { headers });

            if (response.ok) {
                const data = await response.json();
                setBattery(data[0]);
            } else {
                throw new Error('Failed to fetch sensors');
            }
        } catch (error) {
            handleError(error);
        }
    };

    const fetchBatteryModel = async () => {
        try {
            const url = `${config.orionHost}/ngsi-ld/v1/entities?type=BatteryModel&q=refDevice=="${state.idPole}"`;
            const response = await fetch(url, { headers });

            if (response.ok) {
                const data = await response.json();
                setBatteryModelID(data[0].id);
            } else {
                throw new Error('Failed to fetch sensors');
            }
        } catch (error) {
            handleError(error);
        }
    };

    const fetchPole = async () => {
        try {
            const url = `${config.orionHost}/ngsi-ld/v1/entities/${state.idPole}`;
            const response = await fetch(url, { headers });

            if (response.ok) {
                const data = await response.json();
                setPoles(null);
                setPoles(data);
            } else {
                throw new Error('Failed to fetch sensors');
            }
        } catch (error) {
            handleError(error);
        }
    };

    const handleButtonClickPole = () => {
        const url = `${config.orionHost}/ngsi-ld/v1/entities/${state.idPole}/attrs/${poles.deviceState.value === 'OFF' ? 'on' : 'off'}`;

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

    const handleButtonClickLuminaire = () => {
        const url = `${config.orionHost}/ngsi-ld/v1/entities/${luminaire.id}/attrs/${luminaire.powerState.value === 'OFF' ? 'on' : 'off'}`;

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

    useEffect(() => {
        fetchBatteryModel();
        fetchPole();
        fetchDevices();
        setSidebar([
            crosswalk(
                '/crosswalk',
                state.crosswalkID,
                state.crosswalkName,
                state.idPole.endsWith('_0') ? state.idPole : state.idPole1,
                state.idPole.endsWith('_1') ? state.idPole : state.idPole1
            )
        ]);
        setLoading(false);
    }, [state]);

    useEffect(() => {
        fetchBattery();
        const socket = io(config.backendHost, {
            path: '/backend',
            query: {
                roomName: state.idPole.split(':')[3]
            },
            auth: {
                token: config.backendToken
            }
        });

        socket.on('update', (data) => {
            setTimeout(() => {
                fetchPole();
                fetchDevices();
                fetchBattery();
            }, 100);
        });

        return () => {
            socket.disconnect();
        };
    }, [batteryModelID]);

    useEffect(() => {}, [poles, sensors, battery]);

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12} my={2}>
                <Card sx={{ backgroundColor: theme.palette.primary.main }}>
                    <Typography variant="h2" align="center" py={3} color="white">
                        {state.idPole.split(':')[3]}
                    </Typography>
                </Card>
            </Grid>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item lg={12} md={12} sm={12} xs={12}>
                        <Grid container spacing={gridSpacing}>
                            <Grid item lg={4} md={6} sm={12} xs={12}>
                                <OverviewCard
                                    isLoading={isLoading}
                                    type={'UnassessedImpacts'}
                                    crosswalkID={state.crosswalkID}
                                    pole={state.idPole}
                                />
                            </Grid>
                            <Grid item xl={4} lg={6} md={6} sm={12} xs={12}>
                                <MeasurementsCard
                                    isLoading={isLoading}
                                    variable="stateOfCharge"
                                    variableDescription="Battery charge level"
                                    variableSymbol="%"
                                    sensor={battery ? battery.id : null}
                                />
                            </Grid>
                            <Grid item lg={2} md={6} sm={12} xs={12}>
                                <Button fullWidth sx={{ height: '100%', padding: 0 }} onClick={handleButtonClickLuminaire}>
                                    <MainCard
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: '100%',
                                            width: '100%'
                                        }}
                                    >
                                        <LightIcon
                                            color="inherit"
                                            sx={{
                                                fontSize: '7rem',
                                                color:
                                                    luminaire && luminaire.powerState.value === 'ON'
                                                        ? theme.palette.warning.dark
                                                        : theme.palette.grey[500]
                                            }}
                                        />
                                    </MainCard>
                                </Button>
                            </Grid>
                            <Grid item lg={2} md={6} sm={12} xs={12}>
                                <Button fullWidth sx={{ height: '100%', padding: 0 }} onClick={handleButtonClickPole}>
                                    <MainCard
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: '100%',
                                            width: '100%'
                                        }}
                                    >
                                        <PowerSettingsNewIcon
                                            color="inherit"
                                            sx={{
                                                fontSize: '7rem',
                                                color:
                                                    poles && poles.deviceState.value === 'ON'
                                                        ? theme.palette.success.dark
                                                        : theme.palette.error.dark
                                            }}
                                        />
                                    </MainCard>
                                </Button>
                            </Grid>
                        </Grid>
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
                            pole0={state.idPole}
                            pole1={null}
                        />
                    </Grid>
                    <Grid item xl={4} lg={6} md={6} sm={12} xs={12}>
                        <TrafficCard
                            isLoading={isLoading}
                            variable="vehicles"
                            variableDescription="Number of vehicles today"
                            variableSymbol=""
                            poleContext={true}
                            pole0={state.idPole}
                            pole1={null}
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

export default Pole;
