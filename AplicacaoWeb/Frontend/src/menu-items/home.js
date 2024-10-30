import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import GroupsIcon from '@mui/icons-material/Groups';
import SchemaIcon from '@mui/icons-material/Schema';

function overview() {
    const icons = {
        ViewCompactIcon,
        DirectionsWalkIcon,
        GroupsIcon,
        SchemaIcon
    };

    return {
        id: 'home',
        title: 'Home',
        type: 'group',
        children: [
            {
                id: 'overview',
                title: 'Overview',
                type: 'item',
                url: '/overview',
                icon: icons.ViewCompactIcon
            },
            {
                id: 'crosswalks',
                title: 'Crosswalks',
                type: 'item',
                url: '/crosswalks',
                icon: icons.DirectionsWalkIcon
            },
            {
                id: 'clients',
                title: 'Clients',
                type: 'collapse',
                icon: icons.GroupsIcon,
                children: [
                    {
                        id: 'clients',
                        title: 'Overview',
                        type: 'item',
                        url: '/clients'
                    },
                    {
                        id: 'add',
                        title: 'Add new',
                        type: 'item',
                        url: '/client/add'
                    }
                ]
            },
            {
                id: 'data-model',
                title: 'Data model',
                type: 'item',
                url: '/data-model',
                icon: icons.SchemaIcon
            }
        ]
    };
}

export default overview;
