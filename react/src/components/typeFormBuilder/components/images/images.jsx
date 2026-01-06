import Image from 'react-bootstrap/Image';
import {useState} from "react";
import { Buffer } from 'buffer';
import {IsNullOrUndefined} from "../../../../utility/validation/isNullOrUndefined.js";
import { DecompressGzipPng, StringToArrayBuffer} from "../../../../utility/gzip/gzip.js";

const encodingString = "data:image/#{encoding};base64,#{data}"

export const DataImage = ({data, encoding, alt}) => {
    let src = encodingString
    const [png, setPng] = useState(undefined)
    if (IsNullOrUndefined(encoding)) {
        encoding = "png"
    }

    if (IsNullOrUndefined(alt)) {
        alt = "ERROR"
    }

    DecompressGzipPng(new Blob([StringToArrayBuffer(data)])).then(decompressed => {
        src = src.replace("#{encoding}", encoding)
        src = src.replace("#{data}", Buffer.from(decompressed).toString('base64'))
        setPng(src)
    })
    return <Image src={png} fluid alt={alt} />
}