export const ReadRaw = (file, handleResults) => {
    const reader = new FileReader()
    reader.onload = (e) => {
        handleResults(e.target.result)
    };
    reader.readAsText(file)
}

export const ReadJson = (file, handleResult) => {
    ReadRaw(file, (contents) => {
        handleResult(JSON.parse(contents))
    })
}