import { IsNullOrUndefined } from "../../../../utility/validation/isNullOrUndefined"
import { ForEachRow } from "../../operations/operations"

export const SsdsAgSet = (gridRef, column) => {
    return {
        filter: "agSetColumnFilter",
        filterParams: {
            values: (params) => {
                const result = {}
                ForEachRow(gridRef, (row) => {
                    const parts = column.split(".", -1)

                    let current = row.data || undefined

                    if (IsNullOrUndefined(current)) {
                        return
                    }

                    while (parts.length > 0) {
                        const part = parts.shift()
                        current = current[part]
                    }

                    result[current] = true
                })
                params.success(Object.keys(result))
            }
        }
    }
}

export const NewColumn = (gridRef, column, fieldOverwrite, filter, sortable) => {
    let name = column.toLowerCase()
    const upperName = column.toUpperCase()

    if (!IsNullOrUndefined(fieldOverwrite)) {
        name = fieldOverwrite
    }

    if (IsNullOrUndefined(sortable)) {
        sortable = true
    }

    if (IsNullOrUndefined(filter)) {
        filter = true
    }

    let filterData = {}
    if (filter === true) {
        filterData = {...SsdsAgSet(gridRef, name)}
    }

    return {
        headerName: upperName,
        field: name,
        filter,
        sortable,
        flex: 1,
        autoHeaderHeight: true,
        ...filterData,
        enableRowGroup: true,
        enableValue: true,
        pivot: false,
    }
}