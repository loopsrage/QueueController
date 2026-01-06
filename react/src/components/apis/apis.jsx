import {FetchApi} from "../../utility/fetchApi/fetchApi.js";
import {Button, Stack} from "react-bootstrap";
import {KeyValue} from "../typeFormBuilder/components/keyValue/keyValue.jsx";
import {useRef, useState} from "react";

export const InitialFetchRef = (endpoint, handleErr = (err) => console.log(err), params = {}) => {
    const api = ComponentApi({endpoint, handleErr})
    return {
        Api: api,
        headers: {'Content-Type': 'application/json'}
    }
}

export const ComponentApi = ({endpoint, handleErr}) => {
    const api = FetchApi("http://localhost:8080/"+endpoint, {handleErr})
    return {
        at: async (endpoint, params) => await api.fetchJson({endpoint: endpoint, ...params}),
        atContainer: async (endpoint, params) => await api.fetchContainer({endpoint: endpoint, ...params}),
    }
}

export const GetHeaders = (ref, {setHeaders}) => {
    const headers = ref.current.headers

    const handleOnClick = (event) => {
        const st = ref.current
        delete st.headers[event.target.name]
        ref.current = st
        setHeaders(st.headers)
    }

    return Object.keys(headers).map(h => {
        const no = {}
        no[h] = headers[h]
        return (
            <Stack direction={"horizontal"} gap={3}>
                <Button key={h} name={h} onClick={handleOnClick}>Delete</Button>
                <KeyValue key={h} inputKey={headers[h]} inputProps={
                    {
                        name: h,
                        defaultValue: no,
                        onChange: (event) => {
                            const st = ref.current
                            st.headers[event.target.name] = event.target.value
                            ref.current = st
                        },
                    }
                } />
            </Stack>
        )
    })
}

export const AddHeaders = (ref, key, value) => {
    const st = ref.current

    st.headers[key] = value

    ref.current = st
}

export const FetchApiComponent = ({}) => {
    const fetchRef = useRef(InitialFetchRef("/"))
    const [, setHeaders] = useState({})


    const handleOnClick = (event) => {
        AddHeaders(fetchRef, "Name", "value")
        setHeaders(GetHeaders(fetchRef, {setHeaders}))
    }

    return (
        <Stack direction={"vertical"} gap={3}>
            {GetHeaders(fetchRef, {setHeaders})}
            <Button onClick={handleOnClick}>Add Header</Button>
        </Stack>
    )
}