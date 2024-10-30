const config = {
    // basename: only at build time to set, and Don't add '/' at end off BASENAME for breadcrumbs, also Don't put only '/' use blank('') instead,
    // like '/berry-material-react/react/default'
    basename: '/management',
    defaultPath: '/overview',
    fontFamily: `'Roboto', sans-serif`,
    borderRadius: 12,
    oidcConfig: {
        authority: 'http://localhost:49155/oauth2',
        client_id: '79a9c4f2-2b75-4452-ad73-f6a9949b8acd',
        client_secret: 'a4b156f2-9ba7-43fa-8909-3e8a76f52509',
        redirect_uri: 'http://localhost/management/overview',
        metadataUrl: 'http://localhost:49155/idm/applications/79a9c4f2-2b75-4452-ad73-f6a9949b8acd/.well-known/openid-configuration',
        onSigninCallback: (_user) => {
            window.history.replaceState({}, document.title, window.location.pathname);
        },
        onRemoveUser: () => {
            window.location.pathname = '/login';
        }
    },
    orionHost: 'http://localhost:49156',
    nominatimHost: 'http://localhost/nominatim',
    backendHost: 'http://localhost/',
    contextURL: '<http://reverse-proxy/data-model/context-files/context-ngsi.jsonld>',
    quantumLeapHost: 'http://localhost/time-series-data',
    ngsildTenant: 'VALLPASS',
    reverseProxyAccessToken: 'cvUN8FfxRX5V29ikviP7EhDfYKZVjK',
    backendToken: 'lrBPe00memZc0fXYoq3uR8Yd3ZiqVZ'
};

export default config;
