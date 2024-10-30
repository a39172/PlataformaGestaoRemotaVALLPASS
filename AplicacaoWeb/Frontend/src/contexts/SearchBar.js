import { createContext, useState } from 'react';

const SearchBarContext = createContext();

export const SearchBarProvider = ({ children }) => {
    const [context, setContext] = useState();

    return <SearchBarContext.Provider value={{ context, setContext }}>{children}</SearchBarContext.Provider>;
};

export default SearchBarContext;
