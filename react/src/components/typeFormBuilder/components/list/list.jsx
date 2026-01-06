import React, {useEffect, useRef, useState} from "react";
import {Button, Stack} from "react-bootstrap";
import Form from "react-bootstrap/Form";
import {UpdateContainerByPath} from "../../../../utility/containers/containers.js";
import {GetContainer, SetContainer} from "../../operations/operations.jsx";

const InitialListRefState = ({defaultList}) => {
    return {
        list: defaultList || [],
        value: ""
    }
}

export const GetCurrentList = (ref) => {
    return ref.current.list
}

export const GetCurrentListAsOptions = (ref) => {
    const list = GetCurrentList(ref)
    return Object.keys(list).map(k => {
        return <option value={list[k]} key={k}>{list[k]}</option>
    })
}

export const AppendToList = (ref, item) => {
    const st = ref.current
    st.list = [...st.list, item]
    ref.current = st
}

export const HandleValue = (ref, value) => {
    const st = ref.current
    st.value = value
    ref.current = st
}

export const GetCurrentValue = (ref) => {
    return ref.current.value
}

export const ListSelect = ({formRef, inputKey, jsxKey, inputProps}) => {
    const selectRef = useRef(InitialListRefState({defaultList: inputProps.defaultValue}))
    const [, setList] = useState([])

    const handleOnCLick = (event) => {
        AppendToList(selectRef, GetCurrentValue(selectRef))
        HandleValue(selectRef, "")
        const parts = event.target.name.split(".")
        const field = parts[parts.length-1]
        const other = parts[0]
        SetContainer(formRef,  UpdateContainerByPath(GetContainer(formRef), other, field, GetCurrentList(selectRef)))
        setList(GetCurrentList(selectRef))
    }

    const handleOnChange = (event) => {
        HandleValue(selectRef, event.target.value)
    }

    return (
        <Stack direction={"vertical"} gap={3}>
            <Stack direction={"horizontal"} gap={1}>
                {GetCurrentList(selectRef).map(x => {
                    return <p>{x},</p>
                })}
            </Stack>
            <Stack direction={"horizontal"} gap={3}>
                <Button onClick={handleOnCLick} name={inputProps.name}>Add</Button>
                <Form.Control type={"text"} onChange={handleOnChange} defaultValue={GetCurrentValue(selectRef)}/>
            </Stack>
        </Stack>
    )
}
