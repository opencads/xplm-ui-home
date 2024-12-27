import React, { forwardRef } from "react";
import { Flex, useUpdate } from "../../natived";
import { TableApp } from "../TableApp";
import { Button, TableColumnsType } from "antd";
import ActiveSvg from "../../svgs/Active.svg?react";
import Icon from "@ant-design/icons/lib/components/Icon";
import { DeleteOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";

export interface IWorkspaceAppRef {

}

export interface IWorkspaceAppProps {
    style?: React.CSSProperties,
    workspaces?: IWorkspaceRecord[],
    onActive?: (workspace: IWorkspaceRecord) => void,
    onRefresh?: () => void,
    onNew?: () => void,
    onDelete?: (workspace: IWorkspaceRecord) => void,
}

export interface IWorkspaceRecord {
    key: string,
    name: string,
    active?: boolean
}

export const WorkspacesApp = forwardRef<IWorkspaceAppRef, IWorkspaceAppProps>((props, ref) => {
    const columns: TableColumnsType<IWorkspaceRecord> = [
        {
            key: 'index',
            title: "No.",
            width: '4em',
            fixed: 'left',
            render: (value, record, index) => {
                return index + 1;
            }
        },
        {
            title: "Workspace",
            width: '10em',
            key: 'name',
            render: (value, record) => {
                return <Flex verticalCenter>
                    <Icon style={{
                        color: record.active ? 'red' : 'transparent'
                    }} component={ActiveSvg} />
                    <span>{record.name}</span>
                </Flex>;
            }
        },
        {
            title: "Action",
            key: 'action',
            width: '12em',
            fixed: 'right',
            render: (value, record) => {
                return <Flex spacing={'4px'}>
                    {record.active == false ? <Button type='text' icon={<Icon component={ActiveSvg} style={{
                        color: 'red'
                    }}></Icon>} onClick={() => {
                        props.onActive?.(record);
                    }}>{"Active"}</Button> : undefined}
                    <Button type='text' icon={<DeleteOutlined />} onClick={() => {
                        props.onDelete?.(record);
                    }}>{"Delete"}</Button>
                </Flex>;
            }
        }
    ];
    return <Flex direction='column' style={{
        ...props.style
    }}>
        <Flex>
            <Flex style={{ flex: 1 }} spacing={'8px'}>
                <Button type='text' icon={<PlusOutlined />} onClick={props.onNew}>{"New Workspace"}</Button>
            </Flex>
            <Flex>
                <Button type='text' icon={<ReloadOutlined />} onClick={props.onRefresh}>{"Refresh"}</Button>
            </Flex>
        </Flex>
        <TableApp columns={columns} dataSource={props.workspaces ?? []} style={{ flex: 1, height: 0 }}>

        </TableApp>
    </Flex>
});