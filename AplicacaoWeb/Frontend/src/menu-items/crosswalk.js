import ListAltIcon from '@mui/icons-material/ListAlt';
import TrafficIcon from '@mui/icons-material/Traffic';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';

function crosswalk(path, idCrosswalk, nameCrosswalk, idPole0, idPole1) {
    const icons = {
        ListAltIcon,
        TrafficIcon,
        ViewCompactIcon
    };
    return {
        id: 'crosswalk',
        title: 'Crosswalk',
        type: 'group',
        children: [
            {
                id: 'crosswalk',
                title: 'Overview',
                type: 'item',
                url: path,
                icon: icons.ViewCompactIcon,
                breadcrumbs: false,
                state: { id: idCrosswalk, name: nameCrosswalk }
            },
            {
                id: 'details',
                title: 'Details',
                type: 'item',
                url: '/crosswalk/details',
                icon: icons.ListAltIcon,
                breadcrumbs: false,
                state: { id: idCrosswalk, name: nameCrosswalk, idPole0: idPole0, idPole1: idPole1 }
            },
            {
                id: 'poles',
                title: 'Poles',
                type: 'collapse',
                icon: icons.TrafficIcon,
                children: [
                    {
                        id: '0',
                        title: 'Pole 0',
                        type: 'item',
                        url: '/crosswalk/pole-0',
                        breadcrumbs: false,
                        state: { idPole: idPole0, idPole1: idPole1, crosswalkID: idCrosswalk, crosswalkName: nameCrosswalk }
                    },
                    {
                        id: '1',
                        title: 'Pole 1',
                        type: 'item',
                        url: '/crosswalk/pole-1',
                        breadcrumbs: false,
                        state: { idPole: idPole1, idPole1: idPole0, crosswalkID: idCrosswalk, crosswalkName: nameCrosswalk }
                    }
                ]
            }
        ]
    };
}

export default crosswalk;
