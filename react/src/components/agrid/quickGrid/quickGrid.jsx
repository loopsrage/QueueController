import {
    GetGridOptions,
    InitialRefState,
    OnGridReady,
    SaveGridStateOptions,
    SetDataSource,
    SetGridOptions,
    SetHandleSetArgs
} from "../operations/operations.js"
import {IsNullOrUndefined} from "../../../utility/validation/isNullOrUndefined.js"
import {QuickFetch} from "../datasource/datasource.js"
import { useEffect, useRef } from "react"
import {
    DefaultOptions,
    ServerSideDataSourceOptions,
    ServerSideDetailCellRendererParams,
    SidebarOptions,
    StateOptions
} from "../gridOptions/gridOptions"
import {AGGrid} from "../agrid.jsx";

export const QuickGrid = ({inputRef, fetchUrl, fetchQuery, handleGetColumns, inputOptions, handleSetArgs, handleFieldOverwrites, getDetailRowData}) => {

    const gridRef = useRef(InitialRefState(fetchUrl))

    if (!IsNullOrUndefined(inputRef)) {
        gridRef.current = inputRef.current
    }

    let cols = []
    let generateColumns = true
    if (!IsNullOrUndefined(handleGetColumns)) {
        cols = handleGetColumns(gridRef)
        if (!IsNullOrUndefined(cols) && Array.isArray(cols) && cols.length > 0) {
            generateColumns = false
        }
    }

    const gridOptions = {
        columnDefs: cols,
        ...ServerSideDataSourceOptions,
        ...DefaultOptions,
        ...StateOptions(SaveGridStateOptions(gridRef)),
        ...inputOptions,
        ...SidebarOptions,
        ...ServerSideDetailCellRendererParams(gridRef, {getDetailRowData}),
    }

    let qf = QuickFetch(fetchUrl)
    if (!IsNullOrUndefined(fetchQuery)) {
        qf = fetchQuery
    }

    SetGridOptions(gridRef, gridOptions)
    useEffect(() => {
        SetDataSource(gridRef, qf)
    }, [])


    if (!IsNullOrUndefined(handleSetArgs)) {
        SetHandleSetArgs(gridRef, handleSetArgs)
    }

    return (<AGGrid height="80vh" onGridReady={OnGridReady(gridRef, qf, generateColumns, {handleFieldOverwrites})} gridOptions={GetGridOptions(gridRef)}/>)
}