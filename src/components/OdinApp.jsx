import NavBar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';

// import ErrorBoundary from './ErrorBoundary';
import React, {useState} from 'react';
import ErrorBoundary from './ErrorBoundary';
// import axios from 'axios';
/** A top level component designed to contain the rest
 * of the application. Provides a navbar to allow the
 * app to have multiple pages, and will link it's children
 * to the navbar automatically
 * @component
 * @param title    The title to show within the navbar
 * @param navLinks The list of navigation tabs to display.Each will automatically link to the children of the component in order.
*/
function OdinApp(props) {

    const {title, navLinks, icon_src='odin.png', icon_hover_src='odin.png', icon_marginLeft="5px", icon_marginRight="10px"} = props;
    // const key = props.tabKey;
    // const setKey = props.setKey;
    

    // const navList = navLinks;
    const [key, setKey] = useState(navLinks[0]);
    const [iconHover, changeIconHover] = useState(false);

    const createNavList = navLinks.map((nav) =>
        <Nav.Item key={nav}>
            <Nav.Link key={nav} eventKey={nav}>{nav}</Nav.Link>
        </Nav.Item>

    )

    const onSelect = (selectedKey) => {
        console.log(selectedKey);
        setKey(selectedKey);
    }

    const handleHoverOn = () => changeIconHover(true);
    const handleHoverOff = () => changeIconHover(false);

    const childList = React.Children.map(props.children, (child, index) =>
        <Tab.Pane eventKey={navLinks[index]} key={index}>
            {child}
        </Tab.Pane>
    );

    return (
        <ErrorBoundary>
            <NavBar bg='dark' variant='dark'>
                    <NavBar.Brand href='#'>
                        <img
                        src={iconHover ? icon_hover_src : icon_src}
                        height="30"
                        style={{marginLeft: icon_marginLeft, marginRight: icon_marginRight}}
                        className="d-inline-block align-top"
                        alt="Odin Control Logo"
                        onMouseEnter={handleHoverOn}
                        onMouseLeave={handleHoverOff}
                        />
                        {title}
                    </NavBar.Brand>
                    <Nav
                        activeKey={key}
                        defaultActiveKey={navLinks[0]}
                        onSelect={onSelect}>
                            {createNavList}
                    </Nav>
            </NavBar>
            <Tab.Container id="app-tabs" defaultActiveKey={navLinks[0]} activeKey={key}>
            <Tab.Content>
                {/* <ErrorBoundary> */}
                    {childList}
                {/* </ErrorBoundary> */}
            </Tab.Content>
            </Tab.Container>
        </ErrorBoundary>
    )
}

export default OdinApp;