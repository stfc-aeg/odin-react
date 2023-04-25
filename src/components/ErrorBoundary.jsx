import React from 'react';
import Alert from 'react-bootstrap/Alert';
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
            this.state = { error: null, info: null };
        }
    componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({error: error, errorInfo: errorInfo});
    // You can also log error messages to an error reporting service here
    }
 render() {
 if (this.state.errorInfo) {
 // Error path
 return (
 <div>
 <Alert variant='danger'>
 <Alert.Heading>
 There was an error loading this application. Reload page to try again.
 </Alert.Heading>
 <hr />
 <details>
 {this.state.error && <p><b>Error:</b>&nbsp;{this.state.error.toString()}</p>}
 <p>
 {this.state.errorInfo.componentStack}
 </p>
 </details>
 </Alert>
 </div>
 );
 }
 // Normally, just render children
 return this.props.children;
 }
}
export default ErrorBoundary;