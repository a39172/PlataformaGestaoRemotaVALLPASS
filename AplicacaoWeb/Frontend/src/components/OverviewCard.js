import PropTypes, { number } from 'prop-types';
import { useEffect, useState, React } from 'react';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import { Avatar, Box, Grid, Typography } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';

import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';

import config from 'config';

import { useAuth } from 'react-oidc-context';

const CardWrapper = styled(MainCard)(({ theme, bc, b }) => ({
    backgroundColor: bc,
    overflow: 'hidden',
    position: 'relative',
    '&:after': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: b,
        borderRadius: '50%',
        top: -85,
        right: -95,
        [theme.breakpoints.down('sm')]: {
            top: -105,
            right: -140
        }
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: b,
        borderRadius: '50%',
        top: -125,
        right: -15,
        opacity: 0.5,
        [theme.breakpoints.down('sm')]: {
            top: -155,
            right: -70
        }
    }
}));

const OverviewCard = ({ isLoading, type, onVariableChange = () => {}, crosswalkID, pole }) => {
    const theme = useTheme();

    const [error, setError] = useState(null);
    const [variable, setVariable] = useState(0);
    const [variableName, setVariableName] = useState(null);
    const [cardStyles, setCardStyles] = useState({
        icon: null,
        cardBackground: null,
        adornmentBackground: null
    });

    const auth = useAuth();

    const urls = {
        InoperativePoles: crosswalkID
            ? `${config.orionHost}/ngsi-ld/v1/entities?type=Pole&q=deviceState=="OFF"; controlledAsset=="${crosswalkID}"`
            : `${config.orionHost}/ngsi-ld/v1/entities?type=Pole&q=deviceState=="OFF"`,
        LowBatteryPoles: `${config.orionHost}/ngsi-ld/v1/entities?type=BatteryMeasurement&q=stateOfCharge<20`,
        UnassessedImpacts: pole
            ? `${config.orionHost}/ngsi-ld/v1/entities?type=AccidentSensor&q=status=="onGoing"; refDevice=="${pole}"`
            : `${config.orionHost}/ngsi-ld/v1/entities?type=AccidentSensor&q=status=="onGoing"`
    };

    const icons = {
        InoperativePoles: <ErrorIcon fontSize="inherit" sx={{ color: 'white' }} />,
        LowBatteryPoles: <BatteryAlertIcon fontSize="inherit" sx={{ color: 'white' }} />,
        UnassessedImpacts: <ErrorIcon fontSize="inherit" sx={{ color: 'white' }} />
    };

    const variableNames = {
        InoperativePoles: 'Number of inoperative poles',
        LowBatteryPoles: 'Number of poles with low battery',
        UnassessedImpacts: pole ? 'Number of unassessed impacts' : 'Number of poles with unassessed impacts'
    };

    const setContext = () => {
        if (variable === 0) {
            if (onVariableChange) {
                onVariableChange(type, variable);
            }
            setCardStyles({
                icon: <CheckCircleIcon fontSize="inherit" sx={{ color: 'white' }} />,
                cardBackground: theme.palette.success.light,
                adornmentBackground: theme.palette.success.main
            });
        } else {
            if (onVariableChange) {
                onVariableChange(type, null);
            }
            if (type === 'InoperativePoles' || type === 'UnassessedImpacts') {
                setCardStyles({
                    icon: icons[type],
                    cardBackground: theme.palette.error.light,
                    adornmentBackground: theme.palette.error.main
                });
            } else {
                setCardStyles({
                    icon: icons[type],
                    cardBackground: theme.palette.warning.main,
                    adornmentBackground: theme.palette.warning.dark
                });
            }
        }

        setVariableName(variableNames[type]);
    };

    const fetchData = async () => {
        try {
            const headers = {
                Link: `${config.contextURL}; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`,
                'NGSILD-Tenant': `${config.ngsildTenant}`,
                'X-Auth-Token': `${auth.user ? auth.user.access_token : ''}`
            };
            const response = await fetch(urls[type], { headers });

            if (response.ok) {
                const data = await response.json();
                setVariable(data.length);
            } else {
                throw response;
            }
        } catch (error) {
            console.error('Error fetching data: ', error);
            setError(error);
        }
    };

    useEffect(() => {
        fetchData();
        setContext();
    }, [variable, crosswalkID, pole]);

    return (
        <>
            {isLoading ? (
                <SkeletonEarningCard />
            ) : (
                <CardWrapper border={false} content={false} bc={cardStyles.cardBackground} b={cardStyles.adornmentBackground}>
                    <Box sx={{ p: 2.25 }}>
                        <Grid container direction="column">
                            <Grid item>
                                <Grid container justifyContent="space-between">
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
                                            {cardStyles.icon}
                                        </Avatar>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Grid container alignItems="center">
                                    <Grid item>
                                        <Typography
                                            sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75, mb: 0.75, color: 'black' }}
                                        >
                                            {variable}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item sx={{ mb: 1.25 }}>
                                <Typography
                                    sx={{
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        color: 'black'
                                    }}
                                >
                                    {variableName}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </CardWrapper>
            )}
        </>
    );
};

OverviewCard.propTypes = {
    isLoading: PropTypes.bool
};

export default OverviewCard;
