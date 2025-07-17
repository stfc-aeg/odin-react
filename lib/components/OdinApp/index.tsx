import {Children, ReactElement, ReactNode, useMemo, useState, JSX} from 'react';
import type { PropsWithChildren, CSSProperties } from 'react';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

import {Navbar, Nav, NavDropdown, Card, Alert, Button, Stack, Container, Modal} from 'react-bootstrap';
import { MoonFill, LightbulbFill, Info } from 'react-bootstrap-icons';

import odinImg from '../../assets/odin.png';
import ProdinImg from '../../assets/prodin.png'

import {version} from '../../../package.json';

import styles from './styles.module.css'
import { OdinErrorOutlet } from '../OdinErrorContext';

// import type { OdinAppProps, RouteAppProps } from './types';
import { OdinTable, OdinTableRow } from '../OdinTable';

type NavLink_t = string | Record<string, string[]>;


interface OdinAppProps extends PropsWithChildren{
    title: string;
    navLinks?: NavLink_t[];
    icon_marginLeft?: CSSProperties['marginLeft'];
    icon_marginRight?: CSSProperties['marginRight'];
    custom_icon?: string;
}


const Fallback: React.FC<FallbackProps> = (props) => {
    const {error, resetErrorBoundary} = props;
    return (
        <Card>
            <Card.Header>Error!</Card.Header>
            <Card.Body>
                <Stack>
                <Alert variant='danger'>{error.message}</Alert>
                <Button onClick={resetErrorBoundary}>Reset</Button>
                </Stack>
            </Card.Body>
        </Card>
    )
}

interface RouteAppProps extends PropsWithChildren{
    routeLinks?: NavLink_t[];
}

const RouteApp: React.FC<RouteAppProps> = (props) => {
    
    const {routeLinks} = props;
    let childRoute: ReactNode[] = [];

    if(routeLinks && props.children){

        const expandedRouteLinks: string[] = [];

        routeLinks.forEach((link) => {
            if(typeof link === "string"){
                expandedRouteLinks.push(link);
            }else{
                const subLinkRoot = Object.keys(link)[0];
                expandedRouteLinks.push(...link[subLinkRoot].map((subLink) => `${subLinkRoot}/${subLink}`))
            }
        })

        childRoute = Children.map<ReactElement, ReactNode>(props.children, (child, index) => 
                <Route path={expandedRouteLinks[index]} element={child} key={expandedRouteLinks[index]}/>
        ) ?? [];

        childRoute.push(<Route path="/"element={Children.toArray(props.children)[0]} key={"/"}/>)


    }
    if(childRoute.length){
        return (
            <Routes>
                {childRoute.map(route => route)}
            </Routes>
        )
    }else{
        return (
            <Routes>
                <Route path='/' element={props.children} />
            </Routes>
        )
    }
}


const OdinApp: React.FC<OdinAppProps> = (
    {title, navLinks, icon_marginLeft="5px", icon_marginRight="10px", custom_icon, children}
) => {

    // const [key, setKey] = useState(navLinks ? navLinks[0] : "home");
    const [iconHover, changeIconHover] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const [showInfo, setShowInfo] = useState(false);
    
    const handleHoverOn = () => changeIconHover(true);
    const handleHoverOff = () => changeIconHover(false);

    const icon_addr = custom_icon ?? (iconHover ? ProdinImg : odinImg);

    const toggleTheme = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        const htmlElement = document.querySelector("html");
        htmlElement?.setAttribute("data-bs-theme", newDarkMode ? "dark": "light");
    }

    const createNavList = useMemo(() => {
        if(navLinks === undefined || navLinks.length == 0){
            return (
                <Nav.Item key="#">
                    <Nav.Link as={NavLink} to="/">
                        Home
                    </Nav.Link>
                </Nav.Item>
            )
        }else{

            const Navs: JSX.Element[] = [];
            navLinks.forEach((nav) => {
                if(typeof nav == "string"){
                    Navs.push(
                        <Nav.Item key={nav}>
                            <Nav.Link as={NavLink} to={nav}>
                                {nav}
                            </Nav.Link>
                        </Nav.Item>
                    )
                }else{
                    const subLinkRoot = Object.keys(nav)[0];
                    Navs.push(
                        <NavDropdown title={subLinkRoot}>
                            {nav[subLinkRoot].map((subNav) => (
                                <NavDropdown.Item as={NavLink} to={`${subLinkRoot}/${subNav}`}>
                                    {subNav}
                                </NavDropdown.Item>
                            ))}
                        </NavDropdown>
                    )
                }
            });
            return Navs;
        
        }
    }, [navLinks]);


    return (
        // <BrowserRouter>
    <ErrorBoundary FallbackComponent={Fallback}>
        {/* <OdinErrorContext> */}
        <BrowserRouter>
            <Navbar expand="lg"className='bg-body-secondary'>
                <Container>
                <Navbar.Brand href='/'>
                    <img
                    src={icon_addr}
                    className={styles.brandImage}
                    style={{marginLeft: icon_marginLeft, marginRight: icon_marginRight}}
                    alt="Odin Control Logo"
                    onMouseEnter={handleHoverOn}
                    onMouseLeave={handleHoverOff}
                    />
                    {title}
                </Navbar.Brand>
                <Navbar.Toggle/>
                <Navbar.Collapse id='responsive-navbar-nav'>
                <Nav className='me-auto' navbarScroll style={{maxHeight: "100px"}}>
                    {createNavList}
                </Nav>
                </Navbar.Collapse>
                <Nav className={'d-none d-lg-block ' + styles.darkmodeToggle}>
                    <Button className={styles.btn} variant="outline-secondary" onClick={()=> setShowInfo(true)}>
                        <Info className={styles.svg} title="App Info" size={32}/>
                    </Button>
                </Nav>
                <Nav className={'d-none d-lg-block ' + styles.darkmodeToggle}>
                    <Button className={styles.btn} variant="outline-secondary" onClick={toggleTheme}>
                        {darkMode ? <LightbulbFill className={styles.svg} title='Set Light Mode' size={24}/> 
                                : <MoonFill className={styles.svg} title='Set Dark Mode' size={24}/>}
                    </Button>
                </Nav>
            </Container>
            </Navbar>
            <OdinErrorOutlet />
            {<Modal show={showInfo} onHide={() => setShowInfo(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Odin React Info</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Odin React was built with the following libraries:</p>
                    <OdinTable columns={{lib: "Library", version: "Version"}} widths={{lib: "10%"}} size='sm'>
                    <OdinTableRow row={{lib: "Vite", version: import.meta.env.VITE_VERSION_VITE}}/>
                    <OdinTableRow row={{lib: "React", version: import.meta.env.VITE_VERSION_REACT}}/>
                    <OdinTableRow row={{lib: "Node JS", version: import.meta.env.VITE_VERSION_NODEJS}}/>
                    <OdinTableRow row={{lib: "Axios", version: import.meta.env.VITE_VERSION_AXIOS}}/>
                    <OdinTableRow row={{lib: "Bootstrap", version: import.meta.env.VITE_VERSION_BOOTSTRAP}}/>
                    </OdinTable>
                </Modal.Body>
                <Modal.Footer>
                    {`Odin React: ${version}`}
                </Modal.Footer>
            </Modal>}
            <RouteApp routeLinks={navLinks} children={children}/>
        </BrowserRouter>
        {/* </OdinErrorContext> */}
    </ErrorBoundary>
    )

}

export { OdinApp };