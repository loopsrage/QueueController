import React, {useEffect, useRef, useState} from 'react';
import {Container, Stack, Nav} from 'react-bootstrap';
import {App} from "../app/app.jsx";
import { Sidebar} from "../components/sideBar/sideBar.jsx";
import {ControlPanel} from "../apis/controlPanel.jsx";
import {Api} from "../apis/crudApi.jsx";
import {NewGrid} from "../components/crudGridControls/crudGridControls.jsx";

const handleErr = (error) => {
    console.log(error)
}

export const InitialLayoutState = () => {
    return {
        active: undefined,
        apps: {}
    }
}

const Layout = () => {
    const [layoutState, setLayoutState] = useState(InitialLayoutState());

    const handleSetActiveKey = (appKey) => {
        setLayoutState(prev => ({
            ...prev,
            activeAppKey: appKey
        }));
    };

    useEffect(() => {
        ControlPanel(handleErr).Apps().then(appKeys => {
            setLayoutState(prev => {
                const newApps = { ...prev.apps };
                appKeys.forEach(key => {
                    newApps[key] = <NewGrid api={Api({endpoint: key, handleErr})} />;
                });
                return {
                    ...prev,
                    apps: newApps,
                };
            });
        });
    }, []);

    const ActiveAppComponent = layoutState.apps[layoutState.activeAppKey] || null;

    return (
        <Container fluid>
            <Stack direction="horizontal" gap={3}>
                <Sidebar handleSetActive={handleSetActiveKey} handleErr={handleErr} />
                <App
                    style={{width: "100%", height: "100vh"}}
                    active={ActiveAppComponent}
                />
            </Stack>
        </Container>
    );
};

export default Layout;