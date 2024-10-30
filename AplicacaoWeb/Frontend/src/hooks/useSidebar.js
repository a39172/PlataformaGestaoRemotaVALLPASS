import { useContext } from 'react';
import SidebarContext from 'contexts/Sidebar';

const useSidebar = () => {
    const context = useContext(SidebarContext);

    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarContext.Provider');
    }
    return context;
};

export default useSidebar;
