import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Grid, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import Chart from 'react-apexcharts';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import SpeedIcon from '@mui/icons-material/Speed';
import LightModeIcon from '@mui/icons-material/LightMode';
import VideocamIcon from '@mui/icons-material/Videocam';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
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

const MeasurementsCard = ({ isLoading, variable, variableDescription, variableSymbol, sensor }) => {
    const theme = useTheme();

    const [anchorEl, setAnchorEl] = useState(null);
    const [pole, setPole] = useState(null);
    const [values, setValues] = useState([]);
    const [indexes, setIndexes] = useState([]);
    const [error, setError] = useState(null);
    const [value, setValue] = useState(0);
    const auth = useAuth();
    const [cardStyles, setCardStyles] = useState({
        icon: null,
        cardBackground: null,
        adornmentBackground: null
    });

    const setContext = () => {
        setCardStyles({
            cardBackground: variable == 'stateOfCharge' ? theme.palette.success.light : theme.palette.dark.light,
            adornmentBackground: variable == 'stateOfCharge' ? theme.palette.success.main : theme.palette.dark.main
        });
    };

    function icon() {
        switch (variable) {
            case 'temperature':
                return <DeviceThermostatIcon fontSize="inherit" sx={{ color: 'white' }} />;
            case 'relativeHumidity':
                return <OpacityIcon fontSize="inherit" sx={{ color: 'white' }} />;
            case 'atmosphericPressure':
                return <SpeedIcon fontSize="inherit" sx={{ color: 'white' }} />;
            case 'illuminance':
                return <LightModeIcon fontSize="inherit" sx={{ color: 'white' }} />;
            case 'speedMax':
                return <VideocamIcon fontSize="inherit" sx={{ color: 'white' }} />;
            case 'averageSpeed':
                return <VideocamIcon fontSize="inherit" sx={{ color: 'white' }} />;
            case 'stateOfCharge':
                return <BatteryChargingFullIcon fontSize="inherit" sx={{ color: 'white' }} />;
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
            case 'atmosphericPressure':
                return 1100;
            case 'illuminance':
                return 12000;
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

    function valuesArray(valuesAux, indexAux) {
        let combinedArray;

        combinedArray = valuesAux.slice(-7).map((value, index) => {
            const timestamp = convertToUnixTimestamp(indexAux[index]);
            return [timestamp, value];
        });

        setValue(valuesAux[valuesAux.length - 1]);

        setValues(combinedArray);
    }

    function fetchValues() {
        const headers = { 'fiware-servicepath': '/*', Authorization: config.reverseProxyAccessToken };
        let fetchVariable = '';
        if (variable == 'pedestrians' || variable == 'vehicles') {
            fetchVariable = 'intensity';
        } else {
            fetchVariable = variable;
        }

        const url = `${config.quantumLeapHost}/v2/entities/${sensor}/attrs/${fetchVariable}?lastN=7`;

        fetch(url, { headers })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw response;
            })
            .then((data) => {
                valuesArray(data.values, data.index);
            })
            .catch((error) => {
                console.error('Error fetching data: ', error);
                setError(error);
            });
    }

    function convertToUnixTimestamp(apiTimestamp) {
        const date = new Date(apiTimestamp);
        const unixTimestamp = date.getTime();
        return unixTimestamp;
    }

    useEffect(() => {
        fetchValues();
        setContext();
    }, [sensor]);

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
                                <Grid item xs={variable !== 'averageSpeed' && variable !== 'speedMax' ? 6 : 12}>
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
                                {variable !== 'averageSpeed' && variable !== 'speedMax' && (
                                    // Only render the chart if the variable is not "averageSpeed" or "maxSpeed"
                                    <Grid item xs={6}>
                                        <Chart {...chartData} />
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                </CardWrapper>
            )}
        </>
    );
};

MeasurementsCard.propTypes = {
    isLoading: PropTypes.bool
};

export default MeasurementsCard;
