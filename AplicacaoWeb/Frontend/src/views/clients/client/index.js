import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Grid, TextField, Button, Stack } from '@mui/material';
import { gridSpacing } from 'store/constant';
import { useAuth } from 'react-oidc-context';
import config from 'config';
import { useTheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';

const Client = () => {
    const [result, setResult] = useState();
    const [error, setError] = useState(null);
    const [editableFields, setEditableFields] = useState({
        name: '',
        taxID: '',
        email: ''
    });

    const [addressFields, setAddressFields] = useState({
        streetAddress: '',
        postalCode: '',
        addressLocality: '',
        addressCountry: ''
    });
    const [originalEditableFields, setOriginalEditableFields] = useState({});
    const [originalAddressFields, setOriginalAddressFields] = useState({});

    const [isDirty, setIsDirty] = useState(false);
    const { state } = useLocation();
    const auth = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    const handleDelete = async () => {
        const headers = {
            'NGSILD-Tenant': `${config.ngsildTenant}`,
            'X-Auth-Token': `${auth.user ? auth.user.access_token : ''}`
        };

        const url = `${config.orionHost}/ngsi-ld/v1/entities/${state.id}`;

        try {
            const response = await fetch(url, { headers, method: 'DELETE' });
            if (response.ok) {
                navigate('/clients');
            } else {
                console.error(response.status, response.statusText);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === 'streetAddress' || name === 'postalCode' || name === 'addressLocality' || name === 'addressCountry') {
            setAddressFields((prevFields) => ({
                ...prevFields,
                [name]: value
            }));
        } else {
            setEditableFields((prevFields) => ({
                ...prevFields,
                [name]: value
            }));
        }

        setIsDirty(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const headers = {
            Link: `${config.contextURL}; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`,
            'NGSILD-Tenant': `${config.ngsildTenant}`,
            'X-Auth-Token': `${auth.user ? auth.user.access_token : ''}`,
            'Content-Type': 'application/json'
        };

        const patchRequests = [];

        const changedEditableFields = Object.keys(editableFields).filter(
            (fieldName) => editableFields[fieldName] !== originalEditableFields[fieldName]
        );

        const changedAddressFields = Object.keys(addressFields).filter(
            (fieldName) => addressFields[fieldName] !== originalAddressFields[fieldName]
        );

        try {
            if (changedEditableFields.length > 0) {
                if (changedEditableFields.length === 1) {
                    const attributeName = changedEditableFields[0];
                    const url = `${config.orionHost}/ngsi-ld/v1/entities/${state.id}/attrs/${attributeName}`;
                    const payload = {
                        value: editableFields[attributeName],
                        type: 'Property'
                    };
                    const request = fetch(url, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify(payload)
                    });
                    patchRequests.push(request);
                } else {
                    const url = `${config.orionHost}/ngsi-ld/v1/entities/${state.id}/attrs`;
                    const payload = {};

                    changedEditableFields.forEach((fieldName) => {
                        payload[fieldName] = {
                            value: editableFields[fieldName],
                            type: 'Property'
                        };
                    });

                    const request = fetch(url, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify(payload)
                    });
                    patchRequests.push(request);
                }
            }

            if (changedAddressFields.length > 0) {
                const url = `${config.orionHost}/ngsi-ld/v1/entities/${state.id}/attrs`;
                const payload = {
                    address: {
                        value: { ...addressFields },
                        type: 'Property'
                    }
                };
                const request = fetch(url, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify(payload)
                });
                patchRequests.push(request);
            }

            // Execute all patch requests concurrently
            await Promise.all(patchRequests);

            navigate('/clients');
        } catch (error) {
            console.error('Error updating attributes: ', error);
            setError(error);
        }
        setIsDirty(false);
    };

    const getAttributes = async () => {
        const headers = {
            Link: `${config.contextURL}; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`,
            'NGSILD-Tenant': `${config.ngsildTenant}`,
            'X-Auth-Token': `${auth.user ? auth.user.access_token : ''}`
        };
        const url = `${config.orionHost}/ngsi-ld/v1/entities/${state.id}?options=keyValues`;
        try {
            const response = await fetch(url, { headers });
            if (response.ok) {
                const data = await response.json();
                setResult(data);
                setEditableFields((prevFields) => ({
                    ...prevFields,
                    name: data.name || '',
                    taxID: data.taxID || '',
                    email: data.email || ''
                }));
                setAddressFields((prevFields) => ({
                    ...prevFields,
                    streetAddress: data.address?.streetAddress || '',
                    postalCode: data.address?.postalCode || '',
                    addressLocality: data.address?.addressLocality || '',
                    addressCountry: data.address?.addressCountry || ''
                }));

                // Atualizar os campos originais
                setOriginalEditableFields({
                    name: data.name || '',
                    taxID: data.taxID || '',
                    email: data.email || ''
                });

                setOriginalAddressFields({
                    streetAddress: data.address?.streetAddress || '',
                    postalCode: data.address?.postalCode || '',
                    addressLocality: data.address?.addressLocality || '',
                    addressCountry: data.address?.addressCountry || ''
                });
            } else {
                throw response;
            }
        } catch (error) {
            console.error('Error fetching data: ', error);
            setError(error);
        }
    };

    useEffect(() => {
        getAttributes();
    }, []);

    return (
        <MainCard title={`Client | ${editableFields.name}`}>
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12} component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField label="ID" variant="standard" value={state.id} disabled />
                        <TextField label="Name" variant="standard" name="name" value={editableFields.name} onChange={handleChange} />
                        <TextField label="Tax ID" variant="standard" name="taxID" value={editableFields.taxID} onChange={handleChange} />
                        <TextField label="Email" variant="standard" name="email" value={editableFields.email} onChange={handleChange} />
                    </Stack>

                    <Stack spacing={2} mt={6}>
                        <TextField
                            label="Street Address"
                            variant="standard"
                            name="streetAddress"
                            value={addressFields.streetAddress}
                            onChange={handleChange}
                        />
                    </Stack>

                    <Stack direction="row" spacing={2} my={2}>
                        <TextField
                            label="Postal Code"
                            variant="standard"
                            name="postalCode"
                            value={addressFields.postalCode}
                            onChange={handleChange}
                            fullWidth
                        />

                        <TextField
                            label="Address Locality"
                            variant="standard"
                            name="addressLocality"
                            value={addressFields.addressLocality}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Stack>
                    <Stack spacing={2} mb={4}>
                        <TextField
                            label="Address Country"
                            variant="standard"
                            name="addressCountry"
                            value={addressFields.addressCountry}
                            onChange={handleChange}
                        />
                    </Stack>
                    <Grid container spacing={gridSpacing} justifyContent="space-between">
                        <Grid item lg={3} md={7} sm={7} xs={12}>
                            <Button
                                variant="contained"
                                onClick={handleDelete}
                                fullWidth
                                disableElevation
                                size="large"
                                color="error"
                                sx={{ mt: 5 }}
                            >
                                Delete
                            </Button>
                        </Grid>
                        <Grid item lg={3} md={7} sm={7} xs={12}>
                            <Button
                                variant="contained"
                                type="submit"
                                fullWidth
                                disableElevation
                                size="large"
                                color="primary"
                                sx={{ mt: 5 }}
                                disabled={!isDirty}
                            >
                                Save
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default Client;
