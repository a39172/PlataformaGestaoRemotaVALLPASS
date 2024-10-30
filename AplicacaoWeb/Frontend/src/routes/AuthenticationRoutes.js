import { lazy } from 'react';

import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

const Login = Loadable(lazy(() => import('views/authentication/Login')));

const AuthenticationRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/login',
            element: <Login />
        }
    ]
};

export default AuthenticationRoutes;
