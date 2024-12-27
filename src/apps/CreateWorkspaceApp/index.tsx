import React, { forwardRef } from "react";
import { Flex } from "../../natived";
import RequiredSvg from "../../svgs/Required.svg?react";
import Icon from "@ant-design/icons";
import { Button, Input, Select } from "antd";

export interface ICreateWorkspaceAppRef {

}

export interface ICreateWorkspaceAppProps {
    style?: React.CSSProperties,
    workspaceName?: string,
    selectedWorkspacePath?: string,
    allWorkspacePaths?: {
        value: string,
        label: string
    }[],
    selectedContainer?: string,
    allContainers?: {
        value: string,
        label: string
    }[],
    onWorkspaceNameChange?: (value: string) => void,
    onWorkspacePathChange?: (value: string) => void,
    onSelectedContainerChange?: (value: string) => void,
}

export const CreateWorkspaceApp = forwardRef<ICreateWorkspaceAppRef, ICreateWorkspaceAppProps>((props, ref) => {
    return <Flex direction='column' style={props.style} spacing={'8px'}>
        <Flex verticalCenter>
            <Icon component={RequiredSvg} style={{
                color: '#FF3838'
            }} />
            <Flex style={{ alignItems: 'start' }}>{"Workspace Name:"}</Flex>
        </Flex>
        <Input value={props.workspaceName} onChange={e => props.onWorkspaceNameChange?.(e.target.value)}></Input>
        <div style={{ height: '8px' }}></div>
        <Flex verticalCenter>
            <Icon component={RequiredSvg} style={{
                color: '#FF3838'
            }} />
            <Flex style={{ alignItems: 'start' }}>{"Select Container:"}</Flex>
        </Flex>
        <Select options={props.allContainers} value={props.selectedContainer} onChange={(value: string) => {
            props.onSelectedContainerChange?.(value)
        }}></Select>
        <div style={{ height: '8px' }}></div>
        <Flex verticalCenter>
            <Icon component={RequiredSvg} style={{
                color: '#FF3838'
            }} />
            <Flex style={{ alignItems: 'start' }}>{"Select Default Path:"}</Flex>
        </Flex>
        <Select options={props.allWorkspacePaths} value={props.selectedWorkspacePath} onChange={(value: string) => {
            props.onWorkspacePathChange?.(value)
        }}></Select>
        <div style={{ height: '8px' }}></div>
        <Flex>
            <div style={{ flex: 1 }}></div>
            <Flex spacing={'2em'}>
                <Button>{"Cancel"}</Button>
                <Button type='primary'>{"Sure"}</Button>
            </Flex>
        </Flex>
        <Flex style={{ flex: 1 }}></Flex>
    </Flex>
});