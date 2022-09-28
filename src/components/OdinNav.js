import NavBar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import React from 'react';

function OdinNav(props) {
    const key = props.tabKey;
    const setKey = props.setKey;

    const navList = props.navLinks;
    const createNavList = navList.map((nav) =>
        <Nav.Item>
            <Nav.Link key={nav} eventKey={nav}>{nav}</Nav.Link>
        </Nav.Item>

    )

    const onSelect = (selectedKey) => {
        console.log(selectedKey);
        props.setKey(selectedKey);
    }

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
                    // variant='tabs'
                    activeKey={key}
                    defaultActiveKey={navList[0]}
                    onSelect={onSelect}
                >
                    {createNavList}
                </Nav>
        </NavBar>
    )
}

export default OdinNav;