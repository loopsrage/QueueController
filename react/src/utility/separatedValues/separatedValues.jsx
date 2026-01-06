import {ReadRaw} from "../files/fileReader.js";

export const NewSv = (data, {columnDelimiter, rowDelimiter, hasHeaders}) => {
    const lines = data.split(rowDelimiter)
    const firstLine = lines.shift()
    const headers = {}
    const headersReverseIndex = {}
    const rows = {}

    if (hasHeaders) {
        const columns = firstLine.split(columnDelimiter)
        Object.keys(columns).forEach((value, index) => {
            headers[value] = index
            headersReverseIndex[index] = columns[value].replace(/['"]+/g, '').trim()
        })
    }

    let rowIndex = 0
    while (lines.length > 0) {
        rows[rowIndex] =  lines.shift()
        rowIndex++
    }
    return {
        index: {firstLine, headers, headersReverseIndex, rows, rowIndex},
        config: {columnDelimiter, rowDelimiter, hasHeaders}
    }
}

export const RangeLines = (sv, callback) => {
    const { rows } = sv.index
    Object.keys(rows).forEach((value) => {
        callback(sv, rows[value])
    })
}

export const RangeAsJson = (sv, callback) => {
    const {index, config} = sv
    RangeLines(sv, (isv, row) => {
        const columnValues = {}
        const vals = row.split(config.columnDelimiter)
        Object.keys(vals).forEach((val, ind) => {
            columnValues[index.headersReverseIndex[ind]] = vals[ind].replace(/[',"]+/g, '').trim()
        })
        callback(sv, columnValues)
    })
}

export const ReadAsJson = (file, handleResults, {hasHeaders, rowDelimiter, columnDelimiter}) => {
    ReadRaw(file, (contents) => {
        const sv = NewSv(contents, {
            columnDelimiter: columnDelimiter,
            rowDelimiter: rowDelimiter,
            hasHeaders: hasHeaders
        })
        const results = []
        RangeAsJson(sv, (isv, x) => results.push(x) )
        handleResults(results)
    })
}