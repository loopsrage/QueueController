export const DecompressGzipPng = async (compressedData) => {
    const ds = new DecompressionStream('gzip')
    const decompressedStream = compressedData.stream().pipeThrough(ds)
    const reader = decompressedStream.getReader()
    const chunks = []

    while (true) {
        try {
            const { done, value } = await reader.read();
            if (done) break
            chunks.push(value)
        } catch (e) {
            console.error("Decompression failed:", e)
            throw e
        }
    }

    // Combine chunks into a single Uint8Array
    const decompressedLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const decompressed = new Uint8Array(decompressedLength)
    let offset = 0;
    for (const chunk of chunks) {
        decompressed.set(chunk, offset)
        offset += chunk.length
    }

    return decompressed
}

export const DecompressGzip = async (compressedData) => {
    const ds = new DecompressionStream('gzip')
    const decompressedStream = compressedData.stream().pipeThrough(ds)
    const reader = decompressedStream.getReader()
    let result = ''
    while (true) {
        const { done, value } = await reader.read().catch((e) => {console.log(e)})
        if (done) break
        result += new TextDecoder().decode(value)
    }
    return result
}

export const StringToArrayBuffer = (str) => {
    str = atob(str)
    const buffer = new ArrayBuffer(str.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < str.length; i++) {
        view[i] = str.charCodeAt(i);
    }
    return view;
}

export const IsGzip = (data) => {
    if (!data || !(data instanceof Uint8Array) || data.length < 2) {
        return false;
    }

    return data[0] === 0x1f && data[1] === 0x8b;
}
