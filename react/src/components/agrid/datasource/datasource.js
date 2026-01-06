import { IsNullOrUndefined } from "../../../utility/validation/isNullOrUndefined"
import {
    GetGridApi, GetGridOptions,
    GetHandleFieldOverwrite,
    GetServerSideColumnGeneration,
    SetFilterModel,
    SetGridPaginationUuid, SetGroupKeys, SetLastItemId,
    SetPage,
    SetPaginationLimit, SetPivotCols, SetRowGroupCols,
    SetSortModel, SetValueCols
} from "../operations/operations"
import { UpdateColumnDefsFromJson } from "../columnDefs/generate/generate"

export const QuickFetch = (url) => {
    return async (args) => {
        return await fetch(url, {...args}).
        then(result => result.json())
    }
}

export const ServerSideDataSource = (gridRef, fetchQuery, handleErr) => {
    if (IsNullOrUndefined(handleErr)) {
        handleErr = (err) => {console.log(err)}
    }

    return {
        getRows: (params) => {
            const st = gridRef.current
            SetPaginationLimit(gridRef, st.gridApi.getGridOption("cacheBlockSize"))
            SetSortModel(gridRef, params.request.sortModel)
            SetFilterModel(gridRef, params.request.filterModel)
            SetRowGroupCols(gridRef, params.request.rowGroupCols)
            SetGroupKeys(gridRef, params.request.groupKeys)
            SetValueCols(gridRef, params.request.valueCols)
            SetPivotCols(gridRef, params.request.pivotCols)

            Object.keys(st.args).map((key) => {
                if (IsNullOrUndefined(st.args[key])) {
                    delete st.args[key]
                }
            })

            SetPage(gridRef, GetGridApi(gridRef).paginationGetCurrentPage() || 1)
            fetchQuery({...st.args}).then((result) => {
                st.pagination = result.pagination
                SetGridPaginationUuid(gridRef, result.uuid)
                if (GetServerSideColumnGeneration(gridRef)) {
                    if (GetGridApi(gridRef).getRowGroupColumns().length === 0) {
                        UpdateColumnDefsFromJson(gridRef, result.results || [], GetHandleFieldOverwrite(gridRef))
                    }
                }
                SetLastItemId(gridRef, result.results[result.results.length-1]._id)
                params.success({
                    rowData: result.results || [],
                    rowCount: result.pagination?.count,
                })
                gridRef.current = st
            }).catch(reason => handleErr(reason))
            gridRef.current = st
        }
    }
}