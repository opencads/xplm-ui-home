import { forwardRef } from "react";
import { Flex, useUpdate } from "../../natived";
import { ImportFileApp } from "../ImportFileApp";
import useMessage from "antd/es/message/useMessage";
import { Button, Table, TableColumnsType } from "antd";

export interface IDocumentsAppRef {

}

export interface IDocumentsAppProps {
    data: IDocumentRecord[];
}

export interface IDocumentRecord {
    name: string;
    fileName: string;
    number: string;
    partNumber: string;
    remoteState: 'new' | 'checkedIn' | 'checkedOut';
    remoteLastModifiedTime: string;
    lifeCycle: string;
    local: {
        workspaceState: 'untracked' | 'modified' | 'archived';
        localFilePath: string;
        localAttributes: {
            key: string,
            value: string,
            type: string
        }[];
        localChildren: {
            fileName: string,
            name: string,
            number: string,
            partNumber: string
        }[];
        localLastModifiedTime: string;
    };
    remoteAttributes: {
        key: string,
        value: string,
        type: string
    }[];
    remoteChildren: {
        fileName: string,
        name: string,
        number: string,
        partNumber: string
    }[];
}

export const DocumentsApp = forwardRef<IDocumentsAppRef, IDocumentsAppProps>(
    (props, ref) => {
        const renderRemoteState = (state: IDocumentRecord["remoteState"]) => {
            if (state == 'new') {
                return <span style={{ fontSize: '10px', color: '#f5222d' }}>New</span>;
            } else if (state == 'checkedIn') {
                return <span style={{ fontSize: '10px', color: '#389e0d' }}>Checked In</span>;
            } else {
                return <span style={{ fontSize: '10px', color: '#1890ff' }}>Checked Out</span>;
            }
        };
        const renderLocalState = (state: IDocumentRecord["local"]["workspaceState"]) => {
            if (state == 'untracked') {
                return <span style={{ fontSize: '10px', color: '#f5222d' }}>Untracked</span>;
            } else if (state == 'modified') {
                return <span style={{ fontSize: '10px', color: '#389e0d' }}>Modified</span>;
            } else {
                return <span style={{ fontSize: '10px', color: '#1890ff' }}>Archived</span>;
            }
        };
        const [messageApi, contextHolder] = useMessage();
        const columns: TableColumnsType<IDocumentRecord> = [
            {
                key: 'No.',
                title: 'No.',
                fixed: 'left',
                render: (text, record, index) => {
                    return index + 1;
                }
            }, {
                key: 'name',
                title: 'Name',
                dataIndex: 'name'
            }, {
                key: 'number',
                title: 'Number',
                dataIndex: 'number'
            }, {
                key: 'partNumber',
                title: 'Part Number',
                dataIndex: 'partNumber'
            }, {
                key: 'state',
                title: 'State',
                render: (text, record) => {
                    return <Flex>
                        {renderRemoteState(record.remoteState)}
                        {renderLocalState(record.local.workspaceState)}
                    </Flex>
                }
            }, {
                key: 'lifeCycle',
                title: 'Life Cycle',
                dataIndex: 'lifeCycle'
            },
            {
                key: 'operations',
                title: 'Operations',
                fixed: 'right',
                render: (text, record) => {
                    return <Flex spacing={'4px'}>
                        <Button type='text'>{"Check In"}</Button>
                        <Button type='text'>{"Check Out"}</Button>
                    </Flex>
                }
            }
        ];
        return <Flex direction='column' spacing={'4px'}>
            {contextHolder}
            <Flex spacing={'8px'}>
                <ImportFileApp messageApi={messageApi} />
            </Flex>
            <Table dataSource={props.data} columns={columns} ></Table>
        </Flex>
    },
);

