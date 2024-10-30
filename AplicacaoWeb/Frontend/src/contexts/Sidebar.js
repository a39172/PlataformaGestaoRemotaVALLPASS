import { createContext, useState } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [items, setItems] = useState([]);

    const setSidebar = (item) => setItems(item);

    return <SidebarContext.Provider value={{ items, setSidebar }}>{children}</SidebarContext.Provider>;
};

export default SidebarContext;
