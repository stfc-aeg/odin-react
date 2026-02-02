import {Children, PropsWithChildren, ReactElement, ReactNode, useMemo, useState, useRef, JSX, CSSProperties, useEffect} from 'react';

import { HashRouter, NavLink, Route, Routes, useParams } from 'react-router';
// import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { ErrorBoundary, getErrorMessage, type FallbackProps } from "react-error-boundary";
// import getErrorMess

import {Navbar, Nav, NavDropdown, Card, Alert, Button, Stack, Col, Row, Badge} from 'react-bootstrap';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { MoonFill, LightbulbFill, ExclamationCircleFill } from 'react-bootstrap-icons';

import odinImg from '../../assets/odin.png';
import ProdinImg from '../../assets/prodin.png'

import styles from './styles.module.css'
import { OdinErrorOutlet, SingleErrorOutlet, useError } from '../OdinErrorContext';

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
    const message = getErrorMessage(error) ?? "Unknown Rendering Error";
    return (
        <Card>
            <Card.Header>Error!</Card.Header>
            <Card.Body>
                <Stack>
                <Alert variant='danger'>{message}</Alert>
                <Button onClick={resetErrorBoundary}>Reset</Button>
                </Stack>
            </Card.Body>
        </Card>
    )
}

const PageNotFound: React.FC = () => {
    const {"*": splat} = useParams();
    return (
        <div className={styles.notFound}>
            <h2>404</h2>
            <p>The page at <b>{splat}</b> does not exist</p>
            <Button href="/#">Homepage</Button>
        </div>
    )
}

interface routeAppProps extends PropsWithChildren{
    routeLinks?: NavLink_t[];
}

const darkModeAttr = "data-bs-theme";

const RouteApp: React.FC<routeAppProps> = (props) => {
    
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

        childRoute.push(<Route index element={Children.toArray(props.children)[0]} key={"/"}/>)
        childRoute.push(<Route path="*" element={<PageNotFound/>}/>)


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
                <Route index element={props.children} />
            </Routes>
        )
    }
}

interface ScrollableNavListProps {
    navLinks?: NavLink_t[];
}
 
const ScrollableNavList: React.FC<ScrollableNavListProps> = ({navLinks}) => {
    
    const navLinkRef = useRef<HTMLDivElement>(null);
    const [navLinkOffset, setNavLinkOffset] = useState(0);
    const [needsScroll, setNeedsScroll] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    

    useEffect(() => {
        if(navLinkRef.current){
            const observer = new ResizeObserver((entries) => {
                for (let entry of entries){
                    
                    const visibleWidth = Math.round(entry.contentRect.width);
                    const maxWidth = entry.target.scrollWidth;
                    const remainingScroll = maxWidth - (visibleWidth + navLinkOffset);
                    setNeedsScroll(visibleWidth < maxWidth);
                    if(remainingScroll < 0){
                        //we've overscrolled due to size changes, reduce the offset by the overscroll
                        setNavLinkOffset(offset => Math.round(offset + remainingScroll)) // its an addition cause remainingScroll is negative
                    }
                    setCanScrollRight(remainingScroll > 0);

                }
            });

            observer.observe(navLinkRef.current);

            return () => {
                observer.disconnect();
            }
        }
    }, [navLinkOffset]);

    const scrollNavLinks = (direction: "left" | "right") => {
        //method for the scroll buttons to allow the links to be scrolled left/right
        const linkDiv = navLinkRef.current!;
        
        //get the size of the remaining hidden right side of the div
        const remainingScroll = linkDiv.scrollWidth - (linkDiv.clientWidth + navLinkOffset);

        //get the leftmost visible element, even if its slightly cut off
        let childLink: HTMLElement;
        const children = Array.from(linkDiv.children) as HTMLElement[];
        childLink = children.findLast((element) => element.offsetLeft <= navLinkOffset) ?? children[children.length - 1];

        let offset = 0;
        if(direction == "left"){
            //if the leftmost link is not currently cut off, get its previous sibling. otherwise, we want this specific link
            if(childLink.offsetLeft == navLinkOffset){
                //get the previous child, if it exists
                childLink = (childLink.previousElementSibling ?? childLink) as HTMLElement;
            }

            offset = childLink.offsetLeft;
        }else if(direction == "right"){
            childLink = (childLink.nextElementSibling ?? childLink) as HTMLElement;
            
            //if we've enough remaining scroll space on the right to move the childLink element to the leftmost part
            //of whats visible, do so. Otherwise, only move the offset by whatever remaining scrollspace we have
            if(remainingScroll > (childLink.offsetLeft - navLinkOffset))
            {
                offset = childLink.offsetLeft;
            }else{
                offset = navLinkOffset + remainingScroll;
            }
        }
        setNavLinkOffset(offset);
        // setRemainingScroll(linkDiv.scrollWidth - (linkDiv.clientWidth + offset));

    }
    

    const createNavList = useMemo(() => {
        //if no links have been defined, set a default single link called "Home"
        if(navLinks === undefined || navLinks.length == 0){
            return (
                <Nav.Link as={NavLink} to="/" key="#">
                    Home
                </Nav.Link>
            )
        }else{
            const Navs: JSX.Element[] = [];
            navLinks.forEach((nav) => {
                if(typeof nav == "string"){
                    //link is a string, create a single link
                    Navs.push(
                        <Nav.Link as={NavLink} to={nav} key={nav}>
                            {nav}
                        </Nav.Link>
                    )
                }else{
                    //link is an object defining sublinks, create a dropdown
                    const subLinkRoot = Object.keys(nav)[0];
                    Navs.push(
                        <NavDropdown title={subLinkRoot} key={subLinkRoot}>
                            {nav[subLinkRoot].map((subNav) => (
                                <NavDropdown.Item key={subNav} as={NavLink} to={`${subLinkRoot}/${subNav}`}>
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
        <Nav className={styles.navContainer}>
            {needsScroll && 
            <Button size='sm' variant='secondary' onClick={() => scrollNavLinks("left")}
                disabled={navLinkOffset <=0}>
                ◀
            </Button>}
            <Nav variant="underline" ref={navLinkRef} className={styles.navLink} style={{right: `${navLinkOffset}px`}}>
                {createNavList}
            </Nav>
            {needsScroll && 
            <Button size='sm' variant='secondary' onClick={() => scrollNavLinks("right")}
                disabled={!canScrollRight}>
                ▶
            </Button>}
        </Nav>
     );
}


const OdinApp: React.FC<OdinAppProps> = (props: OdinAppProps) =>
{
    const {title, navLinks, icon_marginLeft="5px", icon_marginRight="10px", custom_icon} = props;

    const [iconHover, changeIconHover] = useState(false);
    
    const handleHoverOn = () => changeIconHover(true);
    const handleHoverOff = () => changeIconHover(false);

    const icon_addr = custom_icon ?? (iconHover ? ProdinImg : odinImg);
    const {errors, clearAllError} = useError();

    const toggleTheme = () => {
        const curDarkMode = document.querySelector("html")?.getAttribute(darkModeAttr);
        document.querySelector("html")?.setAttribute(darkModeAttr,
            curDarkMode == "dark" ? "light" : "dark");
    }

    const ErrorPopover = (
        <Popover className={styles.errorPopover}>
            <Popover.Header>
                <Row className={styles.errorHeader}>
                <Col>Errors</Col>
                <Col xs="auto">
                    <Button onClick={() => clearAllError()}>Clear All</Button>
                </Col>
                </Row>
                </Popover.Header>
            <Popover.Body>
                <OdinErrorOutlet/>
            </Popover.Body>
        </Popover>
    )

    return (
    <ErrorBoundary FallbackComponent={Fallback}>
        {/* <OdinErrorContext> */}
        <HashRouter>
            <Navbar className='bg-body-secondary'>
                <Navbar.Brand href='/'>
                    <img
                    src={icon_addr}
                    height="30"
                    style={{marginLeft: icon_marginLeft, marginRight: icon_marginRight}}
                    className="d-inline-block align-top"
                    alt="Odin Control Logo"
                    onMouseEnter={handleHoverOn}
                    onMouseLeave={handleHoverOff}
                    />
                    {title}
                </Navbar.Brand>
                <ScrollableNavList navLinks={navLinks}/>
                <div className='me-auto'/>
                {errors.length > 0 && 
                    <OverlayTrigger overlay={ErrorPopover} trigger="click" placement='bottom-end'>
                        <Nav className={styles.navbarBtn}>
                            <Button className={`${styles.btn} ${styles.errorBtn}`} variant='outline-danger'>
                                <ExclamationCircleFill className={styles.svg} title="See Errors" size={32}/>
                                <Badge bg="none" className={styles.errorCountBadge} pill>
                                    {errors.reduce((a, b) => (a + b.count), 0)}
                                </Badge>
                            </Button>
                            
                        </Nav>
                    </OverlayTrigger>
                }
                <Nav className={`${styles.navbarBtn} d-none d-md-block`}>
                    <Button className={`${styles.btn} ${styles.darkmode}`} onClick={toggleTheme} variant='none'>
                        <LightbulbFill className={`${styles.svg} ${styles.dark}`} title='Set Light Mode' size={32}/>
                        <MoonFill className={`${styles.svg} ${styles.light}`} title='Set Dark Mode' size={32}/>
                    </Button>
                </Nav>
            </Navbar>
            <SingleErrorOutlet/>
            <RouteApp routeLinks={navLinks} children={props.children}/>
        </HashRouter>
    </ErrorBoundary>
    )

}

export { OdinApp };