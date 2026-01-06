import {IsNullOrUndefined} from "../../../utility/validation/isNullOrUndefined.js";
import {
    GetGridApi,
    GetGridOptions,
    GetHandleFieldOverwrite,
    GetServerSideColumnGeneration
} from "../operations/operations.js";
import {UpdateColumnDefsFromJson} from "../columnDefs/generate/generate.js";

export const DefaultOptions = {
    pagination: true,
    paginationPageSize: 100,
    paginationAutoPageSize: false,
    paginationPageSizeSelector: [10, 20, 50, 100],
}

export const SidebarOptions = {
    ...DefaultOptions,
    rowGroupPanelShow: "always",
    sideBar: {
        toolPanels: [
            {
                id: "columns",
                labelDefault: "Columns",
                labelKey: "columns",
                iconKey: "columns",
                toolPanel: "agColumnsToolPanel"
            },
            {
                id: "filters",
                labelDefault: "Filters",
                labelKey: "filters",
                iconKey: "filter",
                toolPanel: "agFiltersToolPanel"
            }
        ]
    },
    maintainColumnOrder: true
}

export const StateOptions = (saveGridState) => {
    return {
        ...DefaultOptions,
        onColumnMoved: saveGridState,
        onColumnVisible: saveGridState,
        onFilterChanged: saveGridState,
        onSortChanged: saveGridState,
        onColumnResized: saveGridState,
        onColumnRowGroupChanged: saveGridState
    }
}

export const ServerSideDataSourceOptions = {
    isServerSideGroup: (params) => Array.isArray(params._id) || Object.keys(params._id).length === 1,
    getServerSideGroupKey: (params) => {
        return Array.isArray(params._id) ? params._id.join(",") : params._id
    },
    getRowId: (params) => {
        return Array.isArray(params.data._id) ? params.data._id.join(",") : params.data._id
    },
    context: {},
    cacheBlockSize: 100,
    maxBlocksInCache: 100,
    detailRowAutoHeight: true,
    keepDetailRows: true,
    keepDetailRowsCount: 20,
    isRowMaster: (params) => {
        return Array.isArray(params._id)
    },
    treeData: true,
    autoGroupColumnDef: {
        hide: true
    },
    groupDisplayType: "groupRows",
    groupRowRenderer: "agGroupCellRenderer",
    blockLoadDebounceMillis: 10,
    rowModelType: "serverSide",
    rowSelection: {
        mode: "multiRow",
    },
}

export const GetDetailRowDataDefault = (gridRef) => {
    return (params) => {
        console.log(params, gridRef)
    }
}

export const ServerSideDetailCellRendererParams = (gridRef, {getDetailRowData}) => {
    const detailGridOptions = {
        columnDefs: [],
        context: GetGridOptions(gridRef).context,
        pagination: true,
        paginationAutoPageSize: true,
        defaultColDef: {
            flex: 1
        }
    }

    if (IsNullOrUndefined(getDetailRowData)) {
        getDetailRowData = GetDetailRowDataDefault(gridRef)
    }

    return {
        detailCellRendererParams: {
            detailGridOptions: detailGridOptions,
            detailRowAutoHeight: true,
            getDetailRowData: getDetailRowData
        }
    }
}