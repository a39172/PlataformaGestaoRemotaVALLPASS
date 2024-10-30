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

import { useAuth } from 'react-oidc-context';

import config from 'config';

const Clients = () => {
    const { items, setSidebar } = useSidebar();
    const { context, setContext } = useSearchBar();
    const theme = useTheme();
    const [isLoading, setLoading] = useState(true);
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);
    const customization = useSelector((state) => state.customization);

    const auth = useAuth();

    const navigate = useNavigate();

    const { state } = useLocation();

    const columns = [
        { field: 'id', headerName: 'ID', flex: 4, editable: false, sortable: false },
        { field: 'name', headerName: 'Name', flex: 8, editable: false, sortable: true },
        { field: 'taxID', headerName: 'Tax ID', flex: 3, editable: false, sortable: false },
        { field: 'email', headerName: 'Email', flex: 7, editable: false, sortable: false },
        { field: 'locality', headerName: 'Locality', flex: 4, editable: false, sortable: true },
        { field: 'postalCode', headerName: 'Postal code', flex: 3, editable: false, sortable: true }
    ];

    const handleRowClick = (event) => {
        navigate('/client', { state: { id: event.row.id } });
    };

    const generateRows = (clients) => {
        setResults([]);
        const rows = [];
        clients.map((client) =>
            client.id.includes(':Client:')
                ? rows.push({
                      id: client.id,
                      name: client.name.value,
                      taxID: client.taxID.value,
                      email: client.email.value,
                      locality: client.address.value.addressLocality,
                      postalCode: client.address.value.postalCode
                  })
                : ''
        );
        setResults(rows);
    };

    function showResults() {
        const headers = {
            Link: `${config.contextURL}; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`,
            'NGSILD-Tenant': `${config.ngsildTenant}`,
            'X-Auth-Token': `${auth.user ? auth.user.access_token : ''}`
        };

        let url = `${config.orionHost}/ngsi-ld/v1/entities?type=Client`;

        if (state != null) {
            switch (state[0]) {
                case 'Name':
                    url = `${config.orionHost}/ngsi-ld/v1/entities?type=Client&q=name~=.*${state[1]}`;
                    break;
                case 'Tax ID':
                    url = `${config.orionHost}/ngsi-ld/v1/entities?type=Client&q=taxID~=.*${state[1]}`;
                    break;
                default:
                    break;
            }
        }

        const response = fetch(url, {
            headers
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw response;
            })
            .then((data) => {
                generateRows(data);
            })
            .catch((error) => {
                console.error('Error fetching data: ', error);
                setError(error);
            });
    }

    useEffect(() => {
        setSidebar([overview()]);
        setContext('clients');
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

export default Clients;
