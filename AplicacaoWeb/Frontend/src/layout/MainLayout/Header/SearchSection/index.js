import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme, styled } from '@mui/material/styles';
import {
    Avatar,
    Box,
    ButtonBase,
    Card,
    ClickAwayListener,
    FormControl,
    FormControlLabel,
    Grid,
    InputAdornment,
    OutlinedInput,
    Paper,
    Popper,
    RadioGroup,
    Typography,
    Radio,
    Stack
} from '@mui/material';
import PopupState, { anchorRef, bindPopper, bindToggle } from 'material-ui-popup-state';
import Transitions from 'ui-component/extended/Transitions';
import { IconAdjustmentsHorizontal, IconSearch, IconX } from '@tabler/icons';
import { shouldForwardProp } from '@mui/system';
import MainCard from 'ui-component/cards/MainCard';
import useSearchBar from 'hooks/useSearchBar';

const PopperStyle = styled(Popper, { shouldForwardProp })(({ theme }) => ({
    zIndex: 1100,
    width: '99%',
    top: '-55px !important',
    padding: '0 12px',
    [theme.breakpoints.down('sm')]: {
        padding: '0 10px'
    }
}));

const OutlineInputStyle = styled(OutlinedInput, { shouldForwardProp })(({ theme }) => ({
    width: 434,
    marginLeft: 16,
    paddingLeft: 16,
    paddingRight: 16,
    '& input': {
        background: 'transparent !important',
        paddingLeft: '4px !important'
    },
    [theme.breakpoints.down('lg')]: {
        width: 250
    },
    [theme.breakpoints.down('md')]: {
        width: '100%',
        marginLeft: 4,
        background: '#fff'
    }
}));

const HeaderAvatarStyle = styled(Avatar, { shouldForwardProp })(({ theme }) => ({
    ...theme.typography.commonAvatar,
    ...theme.typography.mediumAvatar,
    background: theme.palette.secondary.light,
    color: theme.palette.secondary.dark,
    '&:hover': {
        background: theme.palette.secondary.dark,
        color: theme.palette.secondary.light
    }
}));

const SearchSection = () => {
    const theme = useTheme();
    const { context, setContext } = useSearchBar();

    const [value, setValue] = useState('');
    const [open, setOpen] = useState(false);
    const [type, setType] = useState();

    const anchorRef = useRef(null);
    const prevOpen = useRef(open);

    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    const handleSearch = (event) => {
        event.preventDefault();
        if (value) {
            if (context === 'clients') {
                navigate('/clients', { state: [type, value], replace: true });
            } else {
                navigate('/crosswalks', { state: [type, value], replace: true });
            }
        }
    };

    const handleSearchType = (event) => {
        setType(event.target.value);
    };

    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }
        prevOpen.current = open;
    }, [open]);

    return (
        <>
            <Box component="form" onSubmit={handleSearch} sx={{ display: { xs: 'none', md: 'block' } }}>
                <OutlineInputStyle
                    id="input-search-header"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={context === 'clients' ? 'Search for clients' : 'Search for crosswalks'}
                    startAdornment={
                        <InputAdornment position="start">
                            <IconSearch stroke={1.5} size="1rem" color={theme.palette.grey[500]} />
                        </InputAdornment>
                    }
                    endAdornment={
                        <InputAdornment position="end">
                            <ButtonBase sx={{ borderRadius: '12px' }}>
                                <HeaderAvatarStyle variant="rounded" onClick={handleClick} ref={anchorRef}>
                                    <IconAdjustmentsHorizontal stroke={1.5} size="1.3rem" />
                                </HeaderAvatarStyle>
                            </ButtonBase>
                        </InputAdornment>
                    }
                    aria-describedby="search-helper-text"
                    inputProps={{ 'aria-label': 'weight' }}
                />
            </Box>

            <Popper
                placement="bottom-start"
                open={open}
                anchorEl={anchorRef.current}
                disablePortal
                popperOptions={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 20]
                            }
                        }
                    ]
                }}
            >
                {({ TransitionProps }) => (
                    <Transitions position="top-right" in={open} {...TransitionProps}>
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                                    <Grid container direction="column" spacing={2} sx={{ py: 2, px: 2 }}>
                                        <Grid item>
                                            <Typography variant="subtitle1" spacing={2}>
                                                Search for:
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <FormControl>
                                                <RadioGroup value={type} onChange={handleSearchType}>
                                                    <FormControlLabel
                                                        value={context === 'clients' ? 'Name' : 'Client'}
                                                        control={<Radio />}
                                                        label={context === 'clients' ? 'Name' : 'Client'}
                                                    />
                                                    <FormControlLabel
                                                        value={context === 'clients' ? 'Tax ID' : 'Location'}
                                                        control={<Radio />}
                                                        label={context === 'clients' ? 'Tax ID' : 'Location'}
                                                    />
                                                </RadioGroup>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </MainCard>
                            </ClickAwayListener>
                        </Paper>
                    </Transitions>
                )}
            </Popper>
        </>
    );
};

export default SearchSection;
