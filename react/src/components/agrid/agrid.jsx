import "ag-grid-community/styles/ag-theme-alpine.css"
import "ag-grid-community/styles/ag-theme-quartz.css"
import {AgGridReact} from "ag-grid-react";

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import {AllEnterpriseModule} from 'ag-grid-enterprise';
import { IntegratedChartsModule } from "ag-grid-enterprise";
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

ModuleRegistry.registerModules([ AllCommunityModule, AllEnterpriseModule,  IntegratedChartsModule.with(AgChartsEnterpriseModule)]);

export const AGGrid = ({ gridOptions, onGridReady, height }) => {
    const skin = "light"
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                height: height ? height : "100%",
                width: "100%"
            }}
            className={`ag-theme-${skin === "light" ? "quartz" : "quartz-dark"}`}
        >
        <AgGridReact
            getRowId={gridOptions.getRowId}
            onGridReady={onGridReady}
            columnDefs={gridOptions.columnDefs}
            rowData={gridOptions.rowData}
            gridOptions={gridOptions}
            getRowStyle={() => ({ background: "transparent" })}
            domLayout={gridOptions.fill || height ? "normal" : "autoHeight"}
        />
        </div>
    )
}
