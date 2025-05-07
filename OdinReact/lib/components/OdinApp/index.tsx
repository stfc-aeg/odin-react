import React, {Children, ReactElement, ReactNode, useMemo, useState} from 'react';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

import {Navbar, Nav, Card, Alert, Button, Stack} from 'react-bootstrap';
// import Tab from 'react-bootstrap/Tab';

import odinImg from './odin.png'
import ProdinImg from './prodin.png'


interface OdinAppProps {
    title: string;
    navLinks?: string[];
    // icon_src?: string;
    // icon_hover_src?: string;
    icon_marginLeft?: string;
    icon_marginRight?: string;
    children: ReactNode;
}


const Fallback: React.FC<FallbackProps> = (props: FallbackProps) => {
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

interface routeAppProps {
    routeLinks: string[] | undefined;
    children: ReactNode;
}

const RouteApp = ({routeLinks, children}: routeAppProps) => {
    
    let childRoute: ReactNode[] = [];
    if(routeLinks && children){

        childRoute = Children.map<ReactElement, ReactNode>(children, (child, index) => 
                <Route path={routeLinks[index]} element={child} key={routeLinks[index]}/>
        ) ?? [];

        childRoute.push(<Route path="/"element={Children.toArray(children)[0]} key={"/"}/>)

        // console.log(childRoute);


    }
    if(childRoute){
        return (
            <Routes>
                {childRoute.map(route => route)}
            </Routes>
        )
    }else{
        return (
            <Routes>
                <Route path='/' element={children} />
            </Routes>
        )
    }
}

export const OdinApp: React.FC<OdinAppProps> = (props: OdinAppProps) =>
{
    const {title, navLinks, 
        // icon_src="odin.png", icon_hover_src="prodin.png", 
        icon_marginLeft="5px", icon_marginRight="10px"} = props;

    // const [key, setKey] = useState(navLinks ? navLinks[0] : "home");
    const [iconHover, changeIconHover] = useState(false);

    
    const handleHoverOn = () => changeIconHover(true);
    const handleHoverOff = () => changeIconHover(false);
    

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
            return navLinks.map((nav) =>
                <Nav.Item key={nav}>
                    <Nav.Link as={NavLink} to={nav}>
                        {nav}
                    </Nav.Link>
                </Nav.Item>
            )
        }
    }, [navLinks]);


    return (
        // <BrowserRouter>
    <ErrorBoundary FallbackComponent={Fallback}>
        <BrowserRouter>
            <Navbar bg="dark" data-bs-theme="dark">
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
                <Nav>
                    {createNavList}
                </Nav>
            </Navbar>
            <RouteApp routeLinks={navLinks} children={props.children}/>
        </BrowserRouter>
    </ErrorBoundary>
    )

}