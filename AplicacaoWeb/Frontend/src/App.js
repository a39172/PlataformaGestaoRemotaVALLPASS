import { useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';

import { SidebarProvider } from 'contexts/Sidebar';
import { SearchBarProvider } from 'contexts/SearchBar';
import { AuthProvider } from 'react-oidc-context';

// routing
import Routes from 'routes';

// defaultTheme
import themes from 'themes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';

import config from 'config';

// ==============================|| APP ||============================== //

const App = () => {
    const customization = useSelector((state) => state.customization);

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={themes(customization)}>
                <CssBaseline />
                <NavigationScroll>
                    <AuthProvider {...config.oidcConfig}>
                        <SidebarProvider>
                            <SearchBarProvider>
                                <>
                                    <Routes />
                                </>
                            </SearchBarProvider>
                        </SidebarProvider>
                    </AuthProvider>
                </NavigationScroll>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

export default App;
