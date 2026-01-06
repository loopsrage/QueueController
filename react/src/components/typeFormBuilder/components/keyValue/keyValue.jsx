import React, {useEffect, useState} from "react";
import {Stack, Form} from "react-bootstrap";
import {IsNullOrUndefined} from "../../../../utility/validation/isNullOrUndefined.js";

export const KeyValue = ({inputKey, inputProps}) => {
    const keyName = Object.keys(inputProps.defaultValue)[0]
    let keyValue = inputProps.defaultValue[keyName]
    const [y, setY] = useState(<Form.Control type={'text'} onChange={inputProps.onChange} defaultValue={keyValue} />)
    const updateYName = (k, name) => {
        setY(React.cloneElement(y, {
            ...inputProps,
            defaultValue: keyValue,
            name: k + "." + name
        }))
    }
    const [x, setX] = useState(<Form.Control type={'text'} {...inputProps} defaultValue={keyName} onChange={(event) => updateYName(inputKey, event.target.value)} />)

    useEffect(() => {
        updateYName(inputKey, keyName)
    }, []);

    return (
        <Stack direction="horizontal" gap={2}>
            {x}
            {y}
        </Stack>
    )
}
