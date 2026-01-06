import React, { useRef, useState} from "react";

import {Button, Nav, Stack, TabContainer, TabContent, TabPane} from "react-bootstrap";
import {
    AddElement,
    GetContainer, GetElements,
    InitialTypeFormBuilderRefState,
    SetContainer,
    TypeFormBuilder
} from "../../operations/operations.jsx";
import {BuildContainerTree, NewObject, ReadFromContainers} from "../../../../utility/containers/containers.js";
import {IsNullOrUndefined} from "../../../../utility/validation/isNullOrUndefined.js";
import {CenteredModal} from "../../../modal/modal.jsx";

export const TypeFormBuilderModal = ({title, getSchema, handleSave, elementSelector}) => {
    const [show, setShow] = useState(false);
    const [elements, setElements] = useState([])
    const formRef = useRef(InitialTypeFormBuilderRefState(elementSelector))

    const handleOnAdd = () => {
        getSchema().then(data => {
            SetContainer(formRef, BuildContainerTree(null, [], ".", data))
            TypeFormBuilder({formRef, container: GetContainer(formRef)})
            setElements(GetElements(formRef))
            setShow(true)
        })
    }

    const getbody = () => {
        return (<TabContainer id="my-custom-tabs" defaultActiveKey="first">
            <Nav variant="tabs">
                <Nav.Item>
                    <Nav.Link eventKey="first">File Upload</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="second">File Viewer</Nav.Link>
                </Nav.Item>
            </Nav>
            <TabContent>
                <TabPane eventKey="first">
                    {elements}
                </TabPane>
                <TabPane eventKey="second">
                    <pre>{JSON.stringify(GetContainer(formRef)?.value, null, 2)}</pre>
                </TabPane>
            </TabContent>
        </TabContainer>)
    }

    const handleOnClose = () => {
        setShow(false)
    }

    const handleOnSave = () => {
        handleSave(GetContainer(formRef).value)
        setShow(false)
    }

    const handleAddCustomField = () => {
        const elm = {}
        elm[formRef.current.index] = ""
        const current = GetContainer(formRef)
        if (IsNullOrUndefined(ReadFromContainers(current, "root.Fields"))) {
            SetContainer(formRef, NewObject(current, "root.Fields", {}))
        }
        AddElement(formRef, "root.Fields."+formRef.current.index, elm)
        setElements(GetElements(formRef))
    }

    const footerButtons = () => {
        return (
            <Stack direction="horizontal" gap={2}>
                <Button onClick={handleAddCustomField}>Add Field</Button>
                <Button onClick={handleOnSave}>Save</Button>
                <Button onClick={handleOnClose}>Close</Button>
            </Stack>
        )
    }

    return (
        <Stack direction="horizontal" gap={2} >
            <Button onClick={handleOnAdd}>{title}</Button>
            <CenteredModal title={title}
                           body={getbody()}
                           show={show}
                           footer={footerButtons()}/>
        </Stack>
    )
}