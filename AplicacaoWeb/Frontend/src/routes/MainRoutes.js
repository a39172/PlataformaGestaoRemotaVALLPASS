import { lazy } from 'react';
import Protected from './Protected';
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import { Navigate } from 'react-router-dom';

const Overview = Loadable(lazy(() => import('views/overview')));
const Crosswalks = Loadable(lazy(() => import('views/crosswalks')));
const Crosswalk = Loadable(lazy(() => import('views/crosswalks/crosswalk/overview')));
const CrosswalkDetails = Loadable(lazy(() => import('views/crosswalks/crosswalk/details')));
const Clients = Loadable(lazy(() => import('views/clients')));
const Client = Loadable(lazy(() => import('views/clients/client')));
const ClientAdd = Loadable(lazy(() => import('views/clients/add')));
const DataModel = Loadable(lazy(() => import('views/data-model')));
const Pole = Loadable(lazy(() => import('views/pole')));

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            index: true,
            element: (
                <Protected>
                    <Navigate to="/overview" replace />
                </Protected>
            )
        },
        {
            path: '/overview',
            element: (
                <Protected>
                    <Overview />
                </Protected>
            )
        },
        {
            path: '/crosswalks',
            element: (
                <Protected>
                    <Crosswalks />
                </Protected>
            )
        },
        {
            path: '/crosswalk',
            element: (
                <Protected>
                    <Crosswalk />
                </Protected>
            )
        },
        {
            path: '/crosswalk/details',
            element: (
                <Protected>
                    <CrosswalkDetails />
                </Protected>
            )
        },
        {
            path: '/clients',
            element: (
                <Protected>
                    <Clients />
                </Protected>
            )
        },
        {
            path: '/client',
            element: (
                <Protected>
                    <Client />
                </Protected>
            )
        },
        {
            path: '/client/add',
            element: (
                <Protected>
                    <ClientAdd />
                </Protected>
            )
        },
        {
            path: '/data-model',
            element: (
                <Protected>
                    <DataModel />
                </Protected>
            )
        },
        {
            path: '/crosswalk/pole-0',
            element: (
                <Protected>
                    <Pole />
                </Protected>
            )
        },
        {
            path: '/crosswalk/pole-1',
            element: (
                <Protected>
                    <Pole />
                </Protected>
            )
        }
    ]
};

export default MainRoutes;
