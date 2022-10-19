import React from 'react'
// import OdinNav from './OdinNav'
import styles from './styles.module.css'

// export const ExampleComponent = ({ text }) => {
//   return <div className={styles.test}>Example Component: {text}</div>
// }

export { default as OdinApp } from './components/OdinApp';
export { default as TitleCard } from './components/TitleCard';
export { default as StatusBox } from './components/StatusBox';
export { default as ToggleSwitch} from './components/ToggleSwitch';
export { default as ErrorBoundary} from './components/ErrorBoundary';
export { default as OdinForm} from './components/OdinForm';
export {ParameterTable} from './components/ParameterTable';
export {ParameterEntry} from './components/ParameterTable';
export { default as DropdownSelector} from './components/DropdownSelector';

export { default as useApiPut } from './services/useApiPut';
export { default as usePeriodicFetch } from './services/usePeriodicFetch';
export { default as WithEndpoint } from './services/withEndpoint';
export { useAdapterEndpoint } from './services/AdapterEndpoint';