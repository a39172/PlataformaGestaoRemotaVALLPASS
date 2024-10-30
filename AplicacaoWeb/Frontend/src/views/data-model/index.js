import { useEffect } from 'react';

import { Grid } from '@mui/material';
import overview from 'menu-items/home';
import { gridSpacing } from 'store/constant';
import useSidebar from 'hooks/useSidebar';
import MainCard from 'ui-component/cards/MainCard';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const DataModel = () => {
    const { items, setSidebar } = useSidebar();

    useEffect(() => {
        setSidebar([overview()]);
    }, []);

    return (
        <MainCard>
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <SwaggerUI url="http://localhost/data-model/smartDataModel.yml" />
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default DataModel;
