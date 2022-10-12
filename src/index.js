import React from 'react';
// import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { OdinProvider } from './services/odinContext';


// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// ReactDOM.render(<App />, document.getElementById('root'));

import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
const endpointList = ['cryostat', 'spectrometer', 'attocube', 'acquisition']
root.render(
    <OdinProvider endpoints={endpointList}>
        <App tab="home" />
    </OdinProvider>
);

