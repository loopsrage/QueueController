import {Col, Row, Stack} from "react-bootstrap";
import React, {useRef} from "react";
import {Create, DeleteMany, EditCellRenderer} from "../crudElements/crudElements.jsx";
import {QuickGrid} from "../agrid/quickGrid/quickGrid.jsx";
import {
    GetEditRenderer,
    GetToggledNodes,
    InitialRefState,
    Refresh, SetEditRenderer,
    SetHandleFieldOverwrite
} from "../agrid/operations/operations.js";
import {IsNullOrUndefined} from "../../utility/validation/isNullOrUndefined.js";

export const DefaultCellRenderer = (ref, api) => {
    return (params) => <EditCellRenderer handleRefreshGrid={Refresh(ref, api.list)} api={api} id={params.data._id} />
}

export const CrudGrid = ({inputRef, api, controls}) => {
    const gridRef = useRef(InitialRefState())
    if (!IsNullOrUndefined(inputRef)) {
        gridRef.current = inputRef.current
    }

    const handleRefreshGrid = Refresh(gridRef, api.list)
    const handleFieldOverwrite = (ref, columnDefs) => {
        let cr = GetEditRenderer(ref)
        if (IsNullOrUndefined(cr)) {
            cr = DefaultCellRenderer(ref, api)
            SetEditRenderer(ref,  cr)
        }

        columnDefs["edit"] = {
            pinned: 'right',
            cellRenderer: cr,
            lockPosition: true,
            resizable: false,
            sortable: false,
            filter: false
        }
        columnDefs["_id"] = {
            ...columnDefs["_id"],
            hide: true
        }
    }
    const handleSelectedIds = () => {
       return GetToggledNodes(gridRef)
    }

    SetHandleFieldOverwrite(gridRef, handleFieldOverwrite)
    return (
        <>
            <Stack direction="horizontal" gap={2}>
                <Create refreshGrid={handleRefreshGrid}  api={api} />
                <DeleteMany handleSelectedIds={handleSelectedIds} refreshGrid={handleRefreshGrid} api={api} />
                {!IsNullOrUndefined(controls) ? Object.keys(controls).map(k => {
                    return controls[k]
                }) : <></>}
            </Stack>
            <Row>
                <QuickGrid fetchQuery={api.list} inputRef={gridRef} />
            </Row>
        </>
    )
}