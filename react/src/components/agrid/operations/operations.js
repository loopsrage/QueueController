import { ServerSideDataSource } from "../datasource/datasource"

import { IsNullOrUndefined } from "../../../utility/validation/isNullOrUndefined"
import { Buffer } from "buffer"

export const InitialRefState = (tableStorageKey = "CHANGEME") => {
    return {
        tableStorageKey,

        // templates
        columnState: undefined,
        filterState: undefined,

        gridOptions: {},

        // Key identifier for pagination when in use
        pagination: {
            count: 0,
            page: 1,
            pages: 1,
            last: 1,
            from: 1,
            to: 1
        },

        // our tracking of which page to request
        args: {
            uuid: undefined,
            search: "",
            page: 1,
            limit: 1,
            sortModel: undefined,
            filterModel: undefined,
            rowGroupCols: undefined,
            groupKeys: undefined,
            valueCols: undefined,
        },

        // handleSetArgs
        handleSetArgs: undefined,

        // the agrid object
        gridApi: undefined,

        // Column generation
        serverSideColumnGeneration: false,
        handleFieldOverwrite: undefined,
        joinedColumnHash: undefined,

        // Component
        gridComponent: undefined,

        last_api: undefined,

        rowEditRenderer: undefined
    }
}

export const GetEditRenderer = (gridRef) => {
    return gridRef.current.rowEditRenderer
}

export const SetEditRenderer = (gridRef, renderer) => {
    const st = gridRef.current
    st.rowEditRenderer = renderer
    gridRef.current = st
}

export const GetToggledNodes = (gridRef) => {
    return GetGridApi(gridRef).getServerSideSelectionState()
}

export const SetValueCols = (gridRef, valueCols) => {
    const st = gridRef.current
    st.args["valueCols"] =  Buffer.from(JSON.stringify(valueCols)).toString("base64")
    gridRef.current = st
}

export const SetPivotCols = (gridRef, pivotCols) => {
    const st = gridRef.current
    st.args["pivotCols"] =  Buffer.from(JSON.stringify(pivotCols)).toString("base64")
    gridRef.current = st
}

export const SetLastItemId = (gridRef, itemId) => {
    const st = gridRef.current
    st.args["last_id"] = itemId
    gridRef.current = st
}

export const SetHandleFieldOverwrite = (gridRef, handleFieldOverwrite) => {
    const st = gridRef.current
    st.handleFieldOverwrite = handleFieldOverwrite
    gridRef.current = st
}

export const GetHandleFieldOverwrite = (gridRef) => {
    return gridRef.current.handleFieldOverwrite
}

export const SetJoinedColumnHash = (gridRef, hash) => {
    const st = gridRef.current
    st.joinedColumnHash = hash
    gridRef.current = st
}

export const GetJoinedColumnHash = (gridRef) => {
    return gridRef.current.joinedColumnHash
}

export const SetServerSideColumnGeneration = (gridRef, generateColumns) => {
    const st = gridRef.current
    st.serverSideColumnGeneration = generateColumns
    gridRef.current = st
}

export const GetServerSideColumnGeneration = (gridRef) => {
    return gridRef.current.serverSideColumnGeneration
}

export const PersistLocalStorage = (gridRef, storageKey) => {
    const st = gridRef.current
    delete st.gridApi
    delete st.gridOptions
    localStorage.setItem(storageKey, Buffer.from(JSON.stringify(st)).toString("base64"))
    gridRef.current = st
}

export const LoadLocalStorage = (gridRef, storageKey) => {
    let st = gridRef.current
    let existingRef = localStorage.getItem(storageKey)
    if (IsNullOrUndefined(existingRef)) {
        existingRef = Buffer.from(JSON.stringify(st)).toString("base64")
    }

    const buff = Buffer.from(existingRef, "base64").toString()

    st = { ...st, ...JSON.parse(buff) }
    gridRef.current = st
}

export const GetGridApi = (gridRef) => {
    const st = gridRef.current
    return st.gridApi
}

export const GetGridOptions = (gridRef) => {
    return gridRef.current.gridOptions
}

export const SetGridOptions = (gridRef, gridOptions) => {
    const st = gridRef.current
    st.gridOptions = gridOptions
    gridRef.current = st
}

export const SetGridState = (gridRef) => {
    const st = gridRef.current
    st.columnState = st.gridApi?.getColumnState()
    st.filterState = st.gridApi?.getFilterModel()
    gridRef.current = st
}

export const AddPage = (gridRef, count) => {
    const st = gridRef.current
    st.args.page += count
    gridRef.current = st
}

export const SetPaginationLimit = (gridRef, limit) => {
    const st = gridRef.current
    st.args.limit = limit
    gridRef.current = st
}

export const SetGroupKeys = (gridRef, groupKeys) =>{
    const st = gridRef.current
    st.args["groupKeys"] = Buffer.from(JSON.stringify(groupKeys)).toString("base64")
    gridRef.current = st
}

export const SetRowGroupCols = (gridRef) => {
    const st = gridRef.current
    const cols = GetGridApi(gridRef).getRowGroupColumns()
    const names = Object.keys(cols).map(i => cols[i]?.colDef.field)
    st.args["rowGroupCols"] = Buffer.from(JSON.stringify(names)).toString("base64")
    gridRef.current = st
}

export const SetSortModel = (gridRef, sortModel) => {
    const st = gridRef.current
    st.args["sortModel"] = Buffer.from(JSON.stringify(sortModel)).toString("base64")
    gridRef.current = st
}

export const SetFilterModel = (gridRef, filterModel) => {
    const st = gridRef.current
    st.args["filterModel"] = Buffer.from(JSON.stringify(filterModel)).toString("base64")
    gridRef.current = st
}

export const GetSortModel = (gridRef) => {
    return gridRef.current.args.sortModel
}

export const GetFilterModel = (gridRef) => {
    return gridRef.current.args.filterModel
}
export const SetPage = (gridRef, page) => {
    const st = gridRef.current
    st.args.page = page
    gridRef.current = st
}

export const GetPage = (gridRef) => {
    return gridRef.current.args.page
}

export const GetLimit = (gridRef) => {
    return gridRef.current.args.limit
}

export const SetSearch = (gridRef, value) => {
    const st = gridRef.current
    st.args.search = value.toLowerCase()
    gridRef.current = st
}

export const GetSearch = (gridRef) => {
    return gridRef.current.args.search
}

export const SetDataSource = (gridRef, fetchQuery) => {
    const st = gridRef.current
    st.ssds = ServerSideDataSource(gridRef, fetchQuery)
    st.gridApi?.setGridOption("serverSideDatasource", st.ssds)
    gridRef.current = st
}

export const OnGridReady = (gridRef, fetchQuery, generateColumns = false, {handleFieldOverwrites}) => {
    return (params) => {
        const st = gridRef.current
        st.gridApi = params.api
        st.pagination = InitialRefState().pagination
        gridRef.current = st
        SetSearch(gridRef, "")
        SetGridState(gridRef)
        if (generateColumns && !IsNullOrUndefined(handleFieldOverwrites)) {
            SetHandleFieldOverwrite(gridRef, handleFieldOverwrites)
        }
        SetServerSideColumnGeneration(gridRef, generateColumns)
        SetDataSource(gridRef, fetchQuery)
        gridRef.current = st
        params.context.gridRef = gridRef;
    }
}

export const ResetGrid = (gridRef) => {
    return () => {
        const st = gridRef.current
        st.gridApi.resetColumnState()
        st.gridApi.setFilterModel(null)
        st.gridApi.deselectAll()
        st.gridApi.resetColumnState()
        st.gridApi.refreshClientSideRowModel()
        gridRef.current = st
    }
}

export const RestoreGridState = (gridRef) => {
    return (grid) => {
        const gridApi = GetGridApi(gridRef)
        if (!grid || !gridApi) return

        const newGrid = JSON.parse(grid.table_data)

        gridApi.applyColumnState({
            state: newGrid.columnState,
            applyOrder: true
        })

        if (newGrid.filterState) {
            gridApi.setFilterModel(newGrid.filterState)
        }
    }
}

export const GetGridState = (gridRef) => {
    const st = gridRef.current
    return {
        columnState: st.columnState,
        filterState: st.filterState
    }
}

export const SaveGridStateOptions = (gridRef) => {
    return () => {
        const st = gridRef.current
        st.columnState = st.gridApi.getColumnState()
        st.filterState = st.gridApi.getFilterModel()
        gridRef.current = st
    }
}

export const SetGridArgs = (gridRef, key, value) => {
    const st = gridRef.current
    st.args[key] = value
    gridRef.current = st
}

export const Refresh = (gridRef, fetchQuery) => {
    return () => {
        SetGridPaginationUuid(gridRef, undefined)
        SetDataSource(gridRef, fetchQuery)
    }
}

export const UpdateColumns = (gridRef, columnDefs) => {
    GetGridApi(gridRef).setGridOption("columnDefs", columnDefs)
}

export const UpdateDetailColumns = (gridRef, id, columnDefs) => {
    GetGridApi(gridRef).getDetailGridInfo(id)?.api.setGridOption("columnDefs", columnDefs)
}

export const ForEachRow = (gridRef, action) => {
    GetGridApi(gridRef).forEachNode((rowNode) => {
        action(rowNode)
    })
}

export const AllRows = (gridRef) => {
    const rows = []
    ForEachRow(gridRef, (row) => {
        rows.push(row)
    })
    return rows
}

export const SetHandleSetArgs = (gridRef, handleSetArgs) => {
    const st = gridRef.current
    st.handleSetArgs = handleSetArgs
    gridRef.current = st
}

export const GetHandleSetArgs = (gridRef) => {
    return gridRef.current.handleSetArgs
}

export const SetGridPaginationUuid = (gridRef, uid) => {
    const st = gridRef.current
    if (!IsNullOrUndefined(st.args)) {
        st.args.uuid = uid
    }
    gridRef.current = st
}

export const GetGridPaginationUuid = (gridRef) => {
    return gridRef.current.args.uuid
}