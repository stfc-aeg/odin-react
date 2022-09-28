import React from 'react';
// import ReactDOM from 'react-dom';
import App from './App';
import './index.css'

// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// ReactDOM.render(<App />, document.getElementById('root'));

import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App tab="home" />);
