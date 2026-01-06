
import React, {useEffect, useRef, useState} from 'react';
import {Nav} from 'react-bootstrap';
import {ControlPanel} from "../../apis/controlPanel.jsx";

export const InitialSideBarRef = () => {
    return {
        ActiveApp: "Home",
        NavItems: {},
    }
}

export const GetNavItems = (sideBarRef) => {
    const ni = sideBarRef.current.NavItems
    return Object.keys(ni).map(i => ni[i])
}

export const SetNavItems = (ref) => {
    const st = ref.current
    ControlPanel().Apps().then(r => {
        r.forEach(i => st.NavItems[i] = (
            <Nav.Item key={i}>
                <Nav.Link key={i} eventKey={i}>{i}</Nav.Link>
            </Nav.Item>
        ))
    })
    ref.current = st
}

export const Sidebar = ({handleSetActive, handleErr}) => {
    const sideBarRef = useRef(InitialSideBarRef())
    const [,setActive] = useState("")
    const [,setApps] = useState([])

    const handleSetActiveApp = (r) => {
        handleSetActive(r)
        setActive(r)
    }

    useEffect(() => {
        SetNavItems(sideBarRef)
        setApps(GetNavItems(sideBarRef))
    }, []);

    return (
        <div style={{ width: '20%', height: '100vh', backgroundColor: '#f8f9fa' }}>
            <Nav className="flex-column" onSelect={handleSetActiveApp} >
                {GetNavItems(sideBarRef)}
            </Nav>
        </div>
    );
};

