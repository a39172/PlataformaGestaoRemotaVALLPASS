import ReactDOM from 'react-dom';

// third party
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

// project imports
import App from 'App';
import { store } from 'store';
import config from 'config';

// style + assets
import 'assets/scss/style.scss';

// ==============================|| REACT DOM RENDER  ||============================== //

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter basename={config.basename}>
            <App />
        </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);
