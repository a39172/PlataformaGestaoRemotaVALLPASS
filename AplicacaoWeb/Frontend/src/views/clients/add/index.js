import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, TextField, Button, Stack, InputAdornment } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import config from 'config';
import { useAuth } from 'react-oidc-context';

const ClientAdd = () => {
    const [state, setState] = useState({
        id: '',
        name: '',
        taxID: '',
        email: '',
        streetAddress: '',
        postalCode: '',
        addressLocality: '',
        addressCountry: ''
    });

    const idInputRef = useRef(null);

    const auth = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setState((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const headers = {
            Link: `${config.contextURL}; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`,
            'NGSILD-Tenant': `${config.ngsildTenant}`,
            'X-Auth-Token': `${auth.user ? auth.user.access_token : ''}`,
            'Content-Type': 'application/json'
        };

        const payload = {
            id: `urn:ngsi-ld:Client:${state.id}`,
            type: 'Client',
            name: {
                type: 'Property',
                value: state.name
            },
            address: {
                type: 'Property',
                value: {
                    streetAddress: state.streetAddress,
                    postalCode: state.postalCode,
                    addressLocality: state.addressLocality,
                    addressCountry: state.addressCountry
                }
            },
            taxID: {
                type: 'Property',
                value: state.taxID
            },
            email: {
                type: 'Property',
                value: state.email
            }
        };

        try {
            const response = await fetch(`${config.orionHost}/ngsi-ld/v1/entities/`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Limpar os campos após o envio
                setState({
                    id: '',
                    name: '',
                    taxID: '',
                    email: '',
                    streetAddress: '',
                    postalCode: '',
                    addressLocality: '',
                    addressCountry: ''
                });

                // Navegar para a página "/clients"
                navigate('/clients');
            } else {
                console.error('Error:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <MainCard title="Add a new client">
            <Grid container spacing={2}>
                <Grid item xs={12} component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            label="ID"
                            variant="standard"
                            name="id"
                            value={state.id}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">urn:ngsi-ld:Client:</InputAdornment>
                            }}
                            required
                        />
                        <TextField label="Name" variant="standard" name="name" value={state.name} onChange={handleChange} required />
                        <TextField label="Tax ID" variant="standard" name="taxID" value={state.taxID} onChange={handleChange} required />
                        <TextField label="Email" variant="standard" name="email" value={state.email} onChange={handleChange} required />
                    </Stack>

                    <Stack spacing={2} mt={6}>
                        <TextField
                            label="Street Address"
                            variant="standard"
                            name="streetAddress"
                            value={state.streetAddress}
                            onChange={handleChange}
                            required
                        />
                    </Stack>

                    <Stack direction="row" spacing={2} my={2}>
                        <TextField
                            label="Postal Code"
                            variant="standard"
                            name="postalCode"
                            value={state.postalCode}
                            onChange={handleChange}
                            fullWidth
                            required
                        />

                        <TextField
                            label="Address Locality"
                            variant="standard"
                            name="addressLocality"
                            value={state.addressLocality}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Stack>
                    <Stack spacing={2} mb={4}>
                        <TextField
                            label="Address Country"
                            variant="standard"
                            name="addressCountry"
                            value={state.addressCountry}
                            onChange={handleChange}
                            required
                        />
                    </Stack>
                    <Grid container spacing={2} justifyContent="right">
                        <Grid item lg={3} md={7} sm={7} xs={12}>
                            <Button
                                variant="contained"
                                type="submit"
                                fullWidth
                                disableElevation
                                size="large"
                                color="primary"
                                sx={{ mt: 5 }}
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

export default ClientAdd;
