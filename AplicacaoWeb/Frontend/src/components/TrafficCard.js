import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Grid, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import Chart from 'react-apexcharts';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import config from 'config';

import { useAuth } from 'react-oidc-context';

const CardWrapper = styled(MainCard)(({ theme, bc, b }) => ({
    backgroundColor: bc,
    overflow: 'hidden',
    position: 'relative',
    '&:after': {
        content: '""',
        position: 'absolute',
        width: 130,
        height: 130,
        background: b,
        borderRadius: '50%',
        top: -70,
        right: -70,
        [theme.breakpoints.down('sm')]: {
            top: -105,
            right: -140
        }
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        width: 130,
        height: 130,
        background: b,
        borderRadius: '50%',
        top: -100,
        right: 0,
        opacity: 0.5,
        [theme.breakpoints.down('sm')]: {
            top: -155,
            right: -70
        }
    }
}));

const TrafficCard = ({ isLoading, variable, variableDescription, variableSymbol, poleContext, pole0, pole1 }) => {
    const theme = useTheme();

    const [sensors, setSensors] = useState([]);
    const [values, setValues] = useState([]);
    const [error, setError] = useState(null);
    const [value, setValue] = useState(0);
    const auth = useAuth();
    const [cardStyles, setCardStyles] = useState({
        icon: null,
        cardBackground: null,
        adornmentBackground: null
    });

    const headers = {
        Link: `${config.contextURL}; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`,
        'NGSILD-Tenant': `${config.ngsildTenant}`,
        'X-Auth-Token': `${auth.user ? auth.user.access_token : ''}`
    };

    const handleError = (error) => {
        console.error('Error fetching data: ', error);
        setError(error);
    };

    const setContext = () => {
        setCardStyles({
            cardBackground: theme.palette.dark.light,
            adornmentBackground: theme.palette.dark.main
        });
    };

    function icon() {
        switch (variable) {
            case 'pedestrians':
                return <TransferWithinAStationIcon fontSize="inherit" sx={{ color: 'white' }} />;
            case 'vehicles':
                return <DirectionsCarIcon fontSize="inherit" sx={{ color: 'white' }} />;
            default:
                return '';
        }
    }

    function yAxisMax() {
        switch (variable) {
            case 'vehicles':
                return 2000;
            case 'pedestrians':
                return 400;
            default:
                return 100;
        }
    }

    const chartData = {
        type: 'line',
        height: 90,
        options: {
            chart: {
                sparkline: {
                    enabled: true
                }
            },
            dataLabels: {
                enabled: false
            },
            colors: ['#000000'],
            fill: {
                type: 'solid',
                opacity: 1
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            xaxis: {
                type: 'datetime'
            },
            yaxis: {
                min: 0,
                max: yAxisMax(),
                labels: {
                    show: false
                }
            },
            tooltip: {
                theme: 'dark',
                fixed: {
                    enabled: false
                },
                x: {
                    show: true,
                    format: 'dd MMM HH:mm'
                },
                y: {
                    formatter: function (value) {
                        return value + ` ${variableSymbol}`;
                    }
                },
                marker: {
                    show: true
                }
            }
        },
        series: [
            {
                name: 'Value',
                data: values
            }
        ]
    };

    const fetchSensors = async () => {
        try {
            const sensorType = variable === 'pedestrians' ? ':PedestrianSensor:' : ':VehicleSensor:';

            let urls = [];

            if (poleContext) {
                urls = [`${config.orionHost}/ngsi-ld/v1/entities?type=VehicleSensor&q=refDevice=="${pole0}"`];
            } else {
                urls = [
                    `${config.orionHost}/ngsi-ld/v1/entities?type=VehicleSensor&q=refDevice=="${pole0}"`,
                    `${config.orionHost}/ngsi-ld/v1/entities?type=VehicleSensor&q=refDevice=="${pole1}"`
                ];
            }

            const responses = await Promise.all(urls.map((url) => fetch(url, { headers })));

            const sensorIDs = [];
            for (const response of responses) {
                if (response.ok) {
                    const data = await response.json();
                    const filteredSensors = data.filter((element) => element.id.includes(sensorType));
                    sensorIDs.push(...filteredSensors.map((sensor) => sensor.id));
                } else {
                    throw new Error('Failed to fetch sensors');
                }
            }
            setSensors(sensorIDs);
        } catch (error) {
            handleError(error);
        }
    };

    function valuesArray(valuesAux, indexesAux) {
        const mergedValues = valuesAux.flat();
        const mergedIndexes = indexesAux.flat();

        const mergedData = mergedValues.map((value, index) => ({
            value,
            index: new Date(mergedIndexes[index])
        }));

        mergedData.sort((a, b) => b.index - a.index);
        const today = new Date().toLocaleDateString('en-US', { timeZone: 'UTC' });
        const sum = mergedData.reduce((acc, curr) => {
            const date = curr.index.toLocaleDateString('en-US', { timeZone: 'UTC' });
            if (date === today) {
                return acc + curr.value;
            }
            return acc;
        }, 0);
        setValue(sum);

        const filteredValues = mergedData
            .filter((item) => item.index.toLocaleDateString('en-US', { timeZone: 'UTC' }) === today)
            .slice(-7)
            .map((item) => [item.index, item.value]);

        setValues(filteredValues);
    }

    async function fetchValues() {
        const headers = { 'fiware-servicepath': '/*', Authorization: config.reverseProxyAccessToken };
        let fetchVariable = '';
        let lastN = 0;

        switch (variable) {
            case 'pedestrians':
                fetchVariable = 'intensity';
                lastN = 300;
                break;
            case 'vehicles':
                fetchVariable = 'intensity';
                lastN = 300;
                break;
            default:
                fetchVariable = variable;
                lastN = 7;
                break;
        }

        try {
            const fetchPromises = sensors.map(async (sensor) => {
                const url = `${config.quantumLeapHost}/v2/entities/${sensor}/attrs/${fetchVariable}?lastN=${lastN}`;
                try {
                    const response = await fetch(url, { headers });

                    if (response.ok) {
                        return response.json();
                    }

                    throw new Error('Failed to fetch data');
                } catch (error) {
                    console.error(`Error fetching data for sensor ${sensor}:`, error);
                    return { values: [], index: [] };
                }
            });

            const dataArray = await Promise.all(fetchPromises);
            const values = dataArray.map((data) => data.values);
            const indexes = dataArray.map((data) => data.index);

            valuesArray(values, indexes);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error);
        }
    }

    useEffect(() => {
        fetchSensors();
        setContext();
    }, [pole0, pole1]);

    useEffect(() => {
        if (sensors.length > 0) {
            fetchValues();
        }
    }, [sensors]);

    return (
        <>
            {isLoading ? (
                <SkeletonEarningCard />
            ) : (
                <CardWrapper border={false} content={false} bc={cardStyles.cardBackground} b={cardStyles.adornmentBackground}>
                    <Box sx={{ p: 2.25 }}>
                        <Grid container direction="column">
                            <Grid item>
                                <Avatar
                                    variant="rounded"
                                    sx={{
                                        ...theme.typography.commonAvatar,
                                        ...theme.typography.largeAvatar,
                                        backgroundColor: cardStyles.adornmentBackground,
                                        mt: 1
                                    }}
                                >
                                    {icon()}
                                </Avatar>
                            </Grid>
                            <Grid container alignItems="center">
                                <Grid item xs={6}>
                                    <Grid container direction="column">
                                        <Grid item>
                                            <Typography
                                                sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75, mb: 0.75, color: 'black' }}
                                            >
                                                {value} {variableSymbol}
                                            </Typography>
                                        </Grid>
                                        <Grid item sx={{ mb: 1.25 }}>
                                            <Typography
                                                sx={{
                                                    fontSize: '1rem',
                                                    fontWeight: 500,
                                                    color: 'black'
                                                }}
                                            >
                                                {variableDescription}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Grid item xs={6}>
                                    <Chart {...chartData} />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </CardWrapper>
            )}
        </>
    );
};

TrafficCard.propTypes = {
    isLoading: PropTypes.bool
};

export default TrafficCard;
