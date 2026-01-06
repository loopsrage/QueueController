import React, {useEffect, useRef, useState} from "react";
import {Button, Nav, TabContainer, TabContent, TabPane} from "react-bootstrap";
import {CreateGridPanes, DeleteTab, GetPanels, GetTabs, InitialTabRef, NewTab} from "./operations/operations.jsx";
import 'react-tabs/style/react-tabs.css';
import {IsNullOrUndefined} from "../../utility/validation/isNullOrUndefined.js";

export const TabManager = ({tabRef, grids}) => {
    const ref = useRef(InitialTabRef())
    const [, setTabs] = useState(<></>)
    const [, setPanels] = useState(<></>)


    if (IsNullOrUndefined(tabRef)) {
        tabRef.current = ref.current
    }

    useEffect(() => {
        CreateGridPanes(tabRef, grids)
        setTabs(GetTabs(ref))
        setPanels(GetPanels(ref))
    }, []);

    return (
        <TabContainer id="my-custom-tabs" defaultActiveKey="first">
            <Nav variant="tabs">
                {GetTabs(tabRef)}
            </Nav>
            <TabContent>
                {GetPanels(tabRef)}
            </TabContent>
        </TabContainer>
    )
}
