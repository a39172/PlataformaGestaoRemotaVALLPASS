import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Grid, TextField, Stack, Button } from '@mui/material';
import { gridSpacing } from 'store/constant';
import { useAuth } from 'react-oidc-context';
import config from 'config';
import MainCard from 'ui-component/cards/MainCard';
import useSidebar from 'hooks/useSidebar';
import crosswalk from 'menu-items/crosswalk';

const CrosswalkDetails = () => {
    const { items, setSidebar } = useSidebar();
    const [error, setError] = useState(null);
    const { state } = useLocation();
    const auth = useAuth();
    const [isFieldsChanged, setIsFieldsChanged] = useState(false);
    const [editedData, setEditedData] = useState({
        name: '',
        coordinates: '',
        owner: ''
    });
    const [originalData, setOriginalData] = useState({
        name: '',
        coordinates: '',
        owner: ''
    });

    const headers = {
        Link: `${config.contextURL}; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`,
        'NGSILD-Tenant': `${config.ngsildTenant}`,
        'X-Auth-Token': `${auth.user ? auth.user.access_token : ''}`
    };

    const getCrosswalkAttributes = async () => {
        const url = `${config.orionHost}/ngsi-ld/v1/entities/${state.id}?options=keyValues`;
        try {
            const response = await fetch(url, { headers });
            if (response.ok) {
                const data = await response.json();
                const { name, location, owner } = data;

                setEditedData({
                    name: name || '',
                    coordinates: location.coordinates || '',
                    owner: owner || ''
                });

                setOriginalData({
                    name: name || '',
                    coordinates: location.coordinates || '',
                    owner: owner || ''
                });
            } else {
                throw response;
            }
        } catch (error) {
            console.error('Error fetching data: ', error);
            setError(error);
        }
    };

    const handleFieldChange = (fieldName, value) => {
        setEditedData((prevData) => ({
            ...prevData,
            [fieldName]: value
        }));
        setIsFieldsChanged(true);
    };

    const deleteCrosswalk = async () => {
        const url = `${config.orionHost}/ngsi-ld/v1/entities/${state.id}`;
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers
            });
            if (response.ok) {
                navigate('/overview');
            } else {
                throw response;
            }
        } catch (error) {
            console.error('Error deleting crosswalk: ', error);
            setError(error);
        }
    };

    const saveChanges = async () => {
        const url = `${config.orionHost}/ngsi-ld/v1/entities/${state.id}/attrs`;

        const changedAttributes = Object.entries(editedData).filter(([key, value]) => value !== originalData[key]);

        try {
            if (changedAttributes.length === 1) {
                // Only one attribute changed
                const [attributeName, attributeValue] = changedAttributes[0];
                const attrUrl = `${url}/${attributeName}`;

                let payload = {};

                if (attributeName === 'owner') {
                    payload = {
                        object: attributeValue,
                        type: 'Relationship'
                    };
                } else {
                    payload = {
                        value: attributeValue,
                        type: 'Property'
                    };
                }

                const response = await fetch(attrUrl, {
                    method: 'PATCH',
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    // Handle successful response
                } else {
                    throw response;
                }
            } else if (changedAttributes.length > 1) {
                // Multiple attributes changed
                const payload = changedAttributes.reduce((acc, [key, value]) => {
                    if (key === 'owner') {
                        acc[key] = {
                            type: 'Relationship',
                            object: value
                        };
                    } else {
                        acc[key] = {
                            value: value,
                            type: 'Property'
                        };
                    }
                    return acc;
                }, {});

                const response = await fetch(url, {
                    method: 'PATCH',
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    // Handle successful response
                } else {
                    throw response;
                }
            } else {
                // No attributes changed, no need to make a request
                return;
            }
        } catch (error) {
            console.error('Error saving changes: ', error);
            setError(error);
        }
    };

    useEffect(() => {
        setSidebar([crosswalk('/crosswalk', state.id, state.name, state.idPole0, state.idPole1)]);
        getCrosswalkAttributes();
    }, [state]);

    return (
        <MainCard title={`Crosswalk | ${state.name}`}>
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <Stack spacing={2}>
                        <TextField label="ID" variant="standard" value={state.id} disabled />
                        <TextField
                            label="Name"
                            variant="standard"
                            value={editedData.name}
                            onChange={(event) => handleFieldChange('name', event.target.value)}
                        />
                        <TextField
                            label="Coordinates"
                            variant="standard"
                            value={editedData.coordinates}
                            onChange={(event) => handleFieldChange('coordinates', event.target.value)}
                        />
                        <TextField
                            label="Owner"
                            variant="standard"
                            value={editedData.owner}
                            onChange={(event) => handleFieldChange('owner', event.target.value)}
                        />
                    </Stack>
                </Grid>
            </Grid>
            <Grid container spacing={gridSpacing} justifyContent="space-between">
                <Grid item lg={3} md={7} sm={7} xs={12}>
                    <Button
                        variant="contained"
                        fullWidth
                        disableElevation
                        size="large"
                        color="error"
                        onClick={deleteCrosswalk}
                        sx={{ mt: 5 }}
                    >
                        Delete
                    </Button>
                </Grid>
                <Grid item lg={3} md={7} sm={7} xs={12}>
                    <Button
                        variant="contained"
                        fullWidth
                        disableElevation
                        size="large"
                        color="primary"
                        onClick={saveChanges}
                        disabled={!isFieldsChanged}
                        sx={{ mt: 5 }}
                    >
                        Save
                    </Button>
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default CrosswalkDetails;
