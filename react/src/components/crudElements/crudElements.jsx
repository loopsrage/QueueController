import {HandleGet} from"../../apis/crudApi.jsx";
import {useState} from "react";
import {Button, Col, Row, Stack} from "react-bootstrap";
import {CenteredConfirmCancelModal} from "../modal/modal.jsx";
import {TypeFormBuilderModal} from "../typeFormBuilder/components/modal/modal.jsx";

export const Create = ({refreshGrid, api}) => {
    const handleOnSave = (output) => {
        api.create(output).then(() => refreshGrid())
    }
    return <TypeFormBuilderModal title={"Create"} getSchema={api.schema} handleSave={handleOnSave}  />
}

export const Update = ({refreshGrid, api, id}) => {
    const handleOnSave = (output) => {
        api.update(output, id).then(() => refreshGrid())
    }
    return <TypeFormBuilderModal title={"Update"} getSchema={HandleGet(api, id)} handleSave={handleOnSave}  />
}

export const DeleteMany = ({refreshGrid, api, handleSelectedIds}) => {
    const [show, setShow] = useState(false)

    const handleOnCLick = () => {
        setShow(!show)
    }

    const handleConfirm = () => {
        api.deleteIds(handleSelectedIds()).then(refreshGrid())
        setShow(false)
    }

    return (
        <Stack direction="horizontal" gap={2}>
            <Button onClick={handleOnCLick}>Delete</Button>
            <CenteredConfirmCancelModal onConfirm={handleConfirm} show={show}/>
        </Stack>
    )
}

export const Delete = ({refreshGrid, api, id}) => {
    const [show, setShow] = useState(false)

    const handleOnCLick = () => {
        setShow(!show)
    }

    const handleConfirm = () => {
        api.deleteId(id).then(refreshGrid())
    }

    return (
        <Row>
            <Button onClick={handleOnCLick}>Delete</Button>
            <CenteredConfirmCancelModal onConfirm={handleConfirm} show={show}/>
        </Row>
    )
}

export const EditCellRenderer = ({handleRefreshGrid, api, id}) => {
    const props = { refreshGrid: handleRefreshGrid, api, id }
    return (
        <Stack direction="horizontal" gap={3}>
            <Update  {...props} />
            <Delete {...props} />
        </Stack>
    )
}

