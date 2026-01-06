import {Chart} from "react-charts";
import {useRef, useState} from "react";


export const InitialChartRefState = () => {
    return {
        series: {}
    }
}

export const NewXY = (ref, series, x, y) => {
    const st = ref.current
    st.series[series] = [...st.series[series], {x: x, y: y}]
    ref.current = st
}

export const Line = ({data}) => {
    const dataRef = useRef(InitialChartRefState())
    const [, setData] = useState(data)

    const primaryAxis = {
        getValue: (datum) => datum.x,
    };

    const secondaryAxes = [
        {
            getValue: (datum) => datum.y,
        },
    ];

    return (
        <div style={{height: "40vh", width: "100%" }}>
                <Chart
                    options={{
                        data,
                        primaryAxis,
                        secondaryAxes,
                    }}
                />
        </div>
    );
}