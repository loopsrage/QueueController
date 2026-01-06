import React from "react";
import { SciChartReact } from "scichart-react";
import {
    SciChartSurface,
    NumericAxis,
    FastLineRenderableSeries,
    XyDataSeries,
    EThemeProviderType, SciChartJsNavyTheme,
} from "scichart";

export const SimpleLineChart = () => {
    const initChart = async (rootElement) => {
        const { sciChartSurface, wasmContext } = await SciChartSurface.create(rootElement, {
            theme: new SciChartJsNavyTheme()
        });

        // Add X and Y axes
        sciChartSurface.xAxes.add(new NumericAxis(wasmContext));
        sciChartSurface.yAxes.add(new NumericAxis(wasmContext));

        // Create some sample data
        const xValues = Array.from({ length: 100 }, (_, i) => i);
        const yValues = xValues.map((x) => Math.sin(x * 0.1) * 10);

        // Create a DataSeries
        const dataSeries = new XyDataSeries(wasmContext, xValues, yValues);

        // Create a Line Series and add it to the chart
        sciChartSurface.renderableSeries.add(
            new FastLineRenderableSeries(wasmContext, {
                dataSeries: dataSeries,
                strokeThickness: 2,
                stroke: "lightblue",
            })
        );
        dataSeries.update(0, 5, 10);
        return { sciChartSurface, wasmContext };
    };

    return <SciChartReact initChart={initChart} style={{ width: '100%', height: '20vh' }} />
};