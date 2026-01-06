import React, {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import {Api} from "../../../../apis/crudApi.jsx";

export const SelectOptions = ({jsxKey, endpoint, inputProps}) => {
    const [options, setOptions] = useState([(<option value={inputProps.defaultValue} key={jsxKey+"-"+inputProps.defaultValue}>{inputProps.defaultValue}</option>)])
    const ap = Api({endpoint})

    useEffect(() => {
        ap.selectOptions().then(result => {
            setOptions(Object.keys(result).map(k => {
                const id = result[k][Object.keys(result[k])[1]]
                const name = result[k][Object.keys(result[k])[0]]
                return <option value={name} key={jsxKey+"-"+k}>{id}</option>
            }))
        })
    }, []);

    return (
        <Form.Select key={jsxKey} {...inputProps} defaultValue={inputProps.defaultValue} >
            { ...options || <></> }
        </Form.Select>
    )
}