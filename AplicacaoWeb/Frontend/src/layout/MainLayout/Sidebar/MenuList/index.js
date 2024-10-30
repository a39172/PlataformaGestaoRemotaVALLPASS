// material-ui
import { Typography } from '@mui/material';

import NavGroup from './NavGroup';
import useSidebar from 'hooks/useSidebar';

const MenuList = () => {
    const { items } = useSidebar();
    const navItems = items.map((item) => {
        switch (item.type) {
            case 'group':
                return <NavGroup key={item.id} item={item} />;
            default:
                return (
                    <Typography key={item.id} variant="h6" color="error" align="center">
                        Menu Items Error
                    </Typography>
                );
        }
    });

    return <>{navItems}</>;
};

export default MenuList;
