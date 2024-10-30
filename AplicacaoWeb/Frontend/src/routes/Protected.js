import { Navigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const Protected = ({ children }) => {
    const auth = useAuth();

    return <>{auth.isLoading ? '' : auth.isAuthenticated ? children : <Navigate to="/login" />}</>;
};

export default Protected;
