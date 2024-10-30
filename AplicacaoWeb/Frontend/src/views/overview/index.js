import { useEffect, useState } from 'react';

import { Grid, SvgIcon, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import overview from 'menu-items/home';
import { gridSpacing } from 'store/constant';

import OverviewCard from '../../components/OverviewCard';

import useSidebar from 'hooks/useSidebar';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { fontSize } from '@mui/system';

import { ReactComponent as TrafficLightIcon } from '../../assets/icons/traffic-light-svgrepo-com.svg';

const Overview = () => {
    const { items, setSidebar } = useSidebar();
    const theme = useTheme();
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [variables, setVariables] = useState({
        InoperativePoles: null,
        LowBatteryPoles: null,
        UnassessedImpacts: null
    });

    const handleVariableChange = (type, value) => {
        setVariables((prevVariables) => ({
            ...prevVariables,
            [type]: value
        }));
    };

    const checkAllVariablesZero = () => {
        return variables.InoperativePoles === 0 && variables.LowBatteryPoles === 0 && variables.UnassessedImpacts === 0;
    };

    useEffect(() => {
        setSidebar([overview()]);
        setLoading(false);
    }, []);

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item lg={4} md={6} sm={12} xs={12}>
                        <OverviewCard isLoading={isLoading} type={'InoperativePoles'} onVariableChange={handleVariableChange} />
                    </Grid>
                    <Grid item lg={4} md={6} sm={12} xs={12}>
                        <OverviewCard isLoading={isLoading} type={'LowBatteryPoles'} onVariableChange={handleVariableChange} />
                    </Grid>
                    <Grid item lg={4} md={6} sm={12} xs={12}>
                        <OverviewCard isLoading={isLoading} type={'UnassessedImpacts'} onVariableChange={handleVariableChange} />
                    </Grid>
                </Grid>
            </Grid>
            {checkAllVariablesZero() && (
                <Grid item xs={12} mt={12}>
                    <Grid container spacing={gridSpacing} alignItems="center" justifyContent="center">
                        <Grid item xs={12} textAlign="center">
                            <SvgIcon component={TrafficLightIcon} inheritViewBox sx={{ fontSize: '6rem' }} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h1" align="center">
                                Everything looks good!
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            )}
        </Grid>
    );
};

export default Overview;
