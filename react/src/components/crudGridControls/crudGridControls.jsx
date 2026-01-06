import React, {useRef, useState} from "react";
import {InitialRefState, SetGridArgs} from "../agrid/operations/operations.js";
import {IsNullOrUndefined} from "../../utility/validation/isNullOrUndefined.js";
import {ApiButton} from "../apiButton/apiButton.jsx";
import {CrudGrid} from "../crudGrid/crudGrid.jsx";
import {DecompressGzip} from "../../utility/gzip/gzip.js";
import {Ollamma} from "../../apis/controlPanel.jsx";
import {Button, Stack, Form} from "react-bootstrap";

function stringToArrayBuffer(str) {
    str = atob(str)
    const buffer = new ArrayBuffer(str.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < str.length; i++) {
        view[i] = str.charCodeAt(i);
    }
    return view;
}

export const NewGrid = ({api, inputRef, inputControls}) => {
    const ref = useRef(InitialRefState())
    if (IsNullOrUndefined(inputRef)) {
        inputRef = ref
    }

    const [search, setSearch] = useState("")

    const handleOnClick = () => {
        api.at("/VectorSearch", {args: {prompt: search}}).then(r => console.log(r))
    }

    const handleOnChange = (event) => {
        setSearch(event.target.value)
    }

    if (IsNullOrUndefined(inputControls)) {
        inputControls = [<ApiButton key={"Download"} api={api} gridRef={ref} endpoint={"Download"}/>,
            <ApiButton key={"Archive"} api={api} gridRef={ref} endpoint={"Archive"}/>,
            <ApiButton key={"FileContent"} api={api} gridRef={ref} endpoint={"FileContent"} callback={(r) => {
                // Create blob link to download
                DecompressGzip(new Blob([stringToArrayBuffer(r["file_data"])])).then(decompressed => {
                    const blob = new Blob([decompressed], {type: 'data:text/plain;charset=utf-8,'});

                    const url = window.URL.createObjectURL(blob);

                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute(
                        'download',
                        `FileName.csv`,
                    );


                    // Append to html link element page
                    document.body.appendChild(link);

                    // Start download
                    link.click();

                    // Clean up and remove the link
                    link.parentNode.removeChild(link);
                })
            }}/>,
            <ApiButton key={"Analyze"} api={api} gridRef={ref} endpoint={"Analyze"} ollamaApi={Ollamma().Api}/>,
            <Form.Control type={"text"} onChange={handleOnChange}/>,
            <Button onClick={handleOnClick}>Vector Search</Button>,
        ]
    }
    SetGridArgs(ref, "Feature", api.endpoint())
    return <CrudGrid key={api.endpoint()} api={api} inputRef={ref} controls={inputControls} />
}
