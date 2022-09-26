import NavBar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import React from 'react';
import Tab from 'react-bootstrap/Tab';

function OdinNav(props) {

    const navList = props.navLinks;
    const createNavList = navList.map((nav) =>
        <Nav.Item>
            <Nav.Link eventKey={nav}>{nav}</Nav.Link>
        </Nav.Item>

    )

    // const listNavPanels = children.map((child) =>
    //     <Nav.Item>
    //         <Nav.Link eventKey={child.id}>{child.name}</Nav.Link>

    //     </Nav.Item>
    // )
    return (
        <NavBar bg='dark' variant='dark'>
                <NavBar.Brand href='#'>
                    <img
                    src='/odin.png'
                    width="30"
                    height="30"
                    className="d-inline-block align-top"
                    alt="Odin Control Logo"
                    />
                    {props.title}
                </NavBar.Brand>
                <Nav
                    variant='tabs'
                    activeKey={navList[0]}
                    // onSelect={(selectedKey) => {activeKey=selectedKey}}    
                >
                    {createNavList}
                </Nav>
        </NavBar>
    )
}

export default OdinNav;