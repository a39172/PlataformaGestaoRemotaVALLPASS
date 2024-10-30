import { useEffect, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';

import overview from 'menu-items/home';
import { gridSpacing } from 'store/constant';

import useSidebar from 'hooks/useSidebar';
import useSearchBar from 'hooks/useSearchBar';

import config from 'config';
import { useAuth } from 'react-oidc-context';

const Crosswalks = () => {
    const { items, setSidebar } = useSidebar();
    const theme = useTheme();
    const [isLoading, setLoading] = useState(true);
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);
    const { context, setContext } = useSearchBar();
    const customization = useSelector((state) => state.customization);
    const auth = useAuth();
    const navigate = useNavigate();
    const { state } = useLocation();
    const headers = {
        Link: `${config.contextURL}; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`,
        'NGSILD-Tenant': `${config.ngsildTenant}`,
        'X-Auth-Token': `${auth.user ? auth.user.access_token : ''}`
    };

    const columns = [
        { field: 'id', headerName: 'ID', flex: 4, editable: false, sortable: false },
        { field: 'name', headerName: 'Name', flex: 5, editable: false, sortable: true },
        { field: 'client', headerName: 'Client', flex: 5, editable: false, sortable: false }
    ];

    const handleRowClick = (event) => {
        navigate('/crosswalk', { state: { id: event.row.id } });
    };

    const getCoordinates = async () => {
        try {
            const response = await fetch(`${config.nominatimHost}/search?q=${state[1]}&format=geojson`, {
                headers: {
                    Authorization: config.reverseProxyAccessToken
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.features[0].geometry.coordinates;
            } else {
                throw new Error('Network response was not ok.');
            }
        } catch (error) {
            console.error('Error fetching data: ', error);
            setError(error);
        }
    };

    const generateRows = async (crosswalks) => {
        setResults([]);
        const rows = [];

        for (const crosswalk of crosswalks) {
            const clientId = crosswalk.owner.object;
            const clientName = await getClientName(clientId);
            rows.push({ id: crosswalk.id, name: crosswalk.name.value, client: clientName });
        }

        setResults(rows);
    };

    const getClientName = async (clientId) => {
        try {
            const response = await fetch(`${config.orionHost}/ngsi-ld/v1/entities/${clientId}`, { headers });

            if (response.ok) {
                const clientData = await response.json();
                const clientName = clientData.name.value;
                return clientName;
            } else {
                throw new Error('Error fetching client data');
            }
        } catch (error) {
            console.error('Error fetching client data: ', error);
            setError(error);
        }
    };

    const showResults = async () => {
        try {
            let url = `${config.orionHost}/ngsi-ld/v1/entities?type=Crosswalk`;

            if (state !== null) {
                const [type, value] = state;

                switch (type) {
                    case 'Client':
                        url = `${config.orionHost}/ngsi-ld/v1/entities?type=Crosswalk&q=owner~=.*${value}`;
                        break;
                    case 'Location':
                        const coordinates = await getCoordinates();
                        url = `${config.orionHost}/ngsi-ld/v1/entities?type=Crosswalk&georel=near;maxDistance==40000&geometry=Point&coordinates=[${coordinates[1]}, ${coordinates[0]}]`;
                        break;
                    default:
                        break;
                }
            }

            const response = await fetch(url, { headers });

            if (response.ok) {
                const data = await response.json();
                generateRows(data);
            } else {
                throw new Error('Network response was not ok.');
            }
        } catch (error) {
            console.error('Error fetching data: ', error);
            setError(error);
        }
    };

    useEffect(() => {
        setSidebar([overview()]);
        setContext('crosswalks');
        showResults();
        setLoading(false);
    }, [state]);

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <DataGrid
                    autoHeight
                    rows={results}
                    columns={columns}
                    pageSize={30}
                    density="comfortable"
                    onRowClick={handleRowClick}
                    sx={{ backgroundColor: 'white', borderRadius: `${customization.borderRadius}px` }}
                />
            </Grid>
        </Grid>
    );
};

export default Crosswalks;
