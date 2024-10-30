import { useContext } from 'react';
import SearchBarContext from 'contexts/SearchBar';

const useSearchBar = () => {
    const context = useContext(SearchBarContext);

    if (context === undefined) {
        throw new Error('useSearchBar must be used within a SearchBarContext.Provider');
    }
    return context;
};

export default useSearchBar;
