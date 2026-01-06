import {GetJoinedColumnHash, SetJoinedColumnHash, UpdateColumns, UpdateDetailColumns} from "../../operations/operations"
import {NewColumn} from "../newColumn/newColumn"
import {
    BuildContainerTree,
    RangeContainers,
    RangePrimitiveValues,
    RangeValues
} from "../../../../utility/containers/containers.js";
import {IsNullOrUndefined} from "../../../../utility/validation/isNullOrUndefined.js";
import {AddElement} from "../../../typeFormBuilder/operations/operations.jsx";
import {IsPrimitive} from "../../../../utility/validation/IsPrimitive.js";

export const hashString = async (inputString) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(inputString)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)

    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')
}

export const FieldOverwrites = (gridRef, columnDefs, handleFieldOverwrite) => {
    return handleFieldOverwrite(gridRef, columnDefs)
}

export const UpdateColumnDefsFromJson = (gridRef, input, handleFieldOverwrite, id) => {
    const columnDefs = {}

    const container = BuildContainerTree(null, [], '.', input)
    RangePrimitiveValues(container, (params) => {
        const { path, value, containerValue} = params
        const valueType = typeof value
        if (Array.isArray(containerValue)) {
            return
        }

        const cd = NewColumn(gridRef, path, path)
        if (valueType === 'number') {
            cd.filter = 'agNumberColumnFilter'
            columnDefs[path] = cd
            return
        }

        if (path.toLowerCase().includes("date") || path.toLowerCase().includes("modified")) {
            cd.filter = 'agDateColumnFilter'
            columnDefs[path] = cd
            return
        }

        if (valueType === "string") {
            cd.filter = 'agTextColumnFilter'
            columnDefs[path] = cd
            return
        }
        columnDefs[path] = cd
    }, 2)

    if (!IsNullOrUndefined(handleFieldOverwrite)) {
        FieldOverwrites(gridRef, columnDefs, handleFieldOverwrite)
    }

    hashString(Object.keys(columnDefs).join("")).then(hash => {
        if  (!IsNullOrUndefined(id) || GetJoinedColumnHash(gridRef) !== hash && Object.keys(columnDefs).length > 2) {
            const defs = Object.keys(columnDefs).map((k) => {
                return columnDefs[k]
            })
            if (!IsNullOrUndefined(id)) {
                UpdateDetailColumns(gridRef, id, defs)
            } else {
                UpdateColumns(gridRef, defs)
            }
            SetJoinedColumnHash(gridRef, hash)
        }
    })
}