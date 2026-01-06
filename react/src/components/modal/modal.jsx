import Modal from 'react-bootstrap/Modal';
import {Button, Stack} from "react-bootstrap";
import {useState} from "react";
import {IsNullOrUndefined} from "../../utility/validation/isNullOrUndefined.js";

export const CenteredModal = ({title, body, show, footer}) => {
    return (
        <Modal style={{maxHeight: "90vh" }} scrollable={true} show={show} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {body}
            </Modal.Body>
            <Modal.Footer>
                {footer}
            </Modal.Footer>
        </Modal>
    )
}

export const CenteredConfirmCancelModal = ({title, show, onCancel, onConfirm}) => {

    const handleOnCancel = () => {
        if (!IsNullOrUndefined(onCancel)) onCancel()
    }

    const handleOnConfirm = () => {
        if (!IsNullOrUndefined(onConfirm)) onConfirm()
    }

    const footerButtons = () => {
        return (
            <Stack direction={"horizontal"} gap={3}>
                <Button onClick={handleOnCancel}>Cancel</Button>
                <Button onClick={handleOnConfirm}>Confirm</Button>
            </Stack>
        )
    }

    return <CenteredModal title={title ? title: "Are you sure?"} show={show} footer={footerButtons()} />
}