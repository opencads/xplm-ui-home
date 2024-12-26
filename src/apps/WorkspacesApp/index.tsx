import React, { forwardRef } from "react";
import { Flex, useUpdate } from "../../natived";
import { TableApp } from "../TableApp";
import { Button, TableColumnsType } from "antd";
import ActiveSvg from "../../svgs/Active.svg?react";
import Icon from "@ant-design/icons/lib/components/Icon";

export interface IWorkspaceAppRef {

}

export interface IWorkspaceAppProps {
    style?: React.CSSProperties,
    workspaces?: IWorkspaceRecord[],
}

export interface IWorkspaceRecord {
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
                        color: record.active ? 'red' : 'transparent',
                        border: '1px solid red',
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
                return <Flex>
                    {record.active ? <Button icon={<Icon component={ActiveSvg} style={{
                        color: 'red'
                    }}></Icon>}>{"Active"}</Button> : undefined}
                </Flex>;
            }
        }
    ];
    return <Flex direction='column' style={{
        ...props.style
    }}>
        <Flex>

        </Flex>
        <TableApp columns={columns} dataSource={props.workspaces ?? []} style={{ flex: 1, height: 0 }}>

        </TableApp>
    </Flex>
});