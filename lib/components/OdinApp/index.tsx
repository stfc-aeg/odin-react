import {Children, PropsWithChildren, ReactElement, ReactNode, useMemo, useState, JSX} from 'react';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

import {Navbar, Nav, NavDropdown, Card, Alert, Button, Stack} from 'react-bootstrap';
import { MoonFill, LightbulbFill } from 'react-bootstrap-icons';
// import Tab from 'react-bootstrap/Tab';

import odinImg from './odin.png'
import ProdinImg from './prodin.png'

import styles from './styles.module.css'
import { OdinErrorOutlet } from '../OdinErrorContext';

type NavLink_t = string | Record<string, string[]>;


interface OdinAppProps extends PropsWithChildren{
    title: string;
    navLinks?: NavLink_t[];
    icon_marginLeft?: string;
    icon_marginRight?: string;
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

interface routeAppProps extends PropsWithChildren{
    routeLinks?: NavLink_t[];
}

const RouteApp: React.FC<routeAppProps> = (props) => {
    
    const {routeLinks} = props;
    let childRoute: ReactNode[] = [];

    if(routeLinks && props.children){

        let expandedRouteLinks: string[] = [];

        routeLinks.forEach((link) => {
            if(typeof link === "string"){
                expandedRouteLinks.push(link);
            }else{
                let subLinkRoot = Object.keys(link)[0];
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

export const OdinApp: React.FC<OdinAppProps> = (props: OdinAppProps) =>
{
    const {title, navLinks, icon_marginLeft="5px", icon_marginRight="10px"} = props;

    // const [key, setKey] = useState(navLinks ? navLinks[0] : "home");
    const [iconHover, changeIconHover] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    
    const handleHoverOn = () => changeIconHover(true);
    const handleHoverOff = () => changeIconHover(false);

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

            let Navs: JSX.Element[] = [];
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
                <Navbar.Brand href='/'>
                    <img
                    src={iconHover ? ProdinImg : odinImg}
                    height="30"
                    style={{marginLeft: icon_marginLeft, marginRight: icon_marginRight}}
                    className="d-inline-block align-top"
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
                <Nav className={'me-2 d-none d-lg-block ' + styles.darkmodeToggle}>
                    <Button className={styles.btn} variant={darkMode? "outline-light" : "outline-dark" } onClick={toggleTheme}>
                        {darkMode ? <LightbulbFill className={styles.svg} title='Set Light Mode' size={24}/> 
                                : <MoonFill className={styles.svg} title='Set Dark Mode' size={24}/>}
                    </Button>
                </Nav>
            </Navbar>
            <OdinErrorOutlet />
            <RouteApp routeLinks={navLinks} children={props.children}/>
        </BrowserRouter>
        {/* </OdinErrorContext> */}
    </ErrorBoundary>
    )

}
