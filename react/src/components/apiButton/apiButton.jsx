import {GetFilterModel, GetToggledNodes, Refresh} from "../agrid/operations/operations.js";
import {Button} from "react-bootstrap";
import React from "react";
import {IsNullOrUndefined} from "../../utility/validation/isNullOrUndefined.js";

export const ApiButton = ({gridRef, api, endpoint, callback, ollamaApi}) => {
    const handleRefreshGrid = Refresh(gridRef, api.list)
    const onReplay = () => {
        let result = GetToggledNodes(gridRef)

        let sendArguments = { ...result, filterModel: GetFilterModel(gridRef), Feature: api.endpoint()}
        if (!result.selectAll) {
            sendArguments.toggledNodes = result.toggledNodes.map(n => n)
        }

        if (!IsNullOrUndefined(ollamaApi)) {
            ollamaApi.at("/"+endpoint, {
                fetchParams: {method: "POST"},
                args: sendArguments}).then(r => {
                handleRefreshGrid()
                return r
            })
        } else{
            api.at("/"+endpoint, {
                fetchParams: {method: "POST"},
                args: sendArguments}).then(r => {
                handleRefreshGrid()
                return r
            }).then(r1 => callback ? callback(r1) : console.log(r1))
        }
    }
    return <Button onClick={onReplay}>{endpoint}</Button>
}
