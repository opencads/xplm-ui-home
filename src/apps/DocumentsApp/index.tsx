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
    number: string;
    partNumber: string;
    state: 'new' | 'checkedIn' | 'checkedOut';
    lifeCycle: string;
}

export const DocumentsApp = forwardRef<IDocumentsAppRef, IDocumentsAppProps>(
    (props, ref) => {
        const [messageApi, contextHolder] = useMessage();
        const columns: TableColumnsType<IDocumentRecord> = [
            {
                key: 'No.',
                title: 'No.',
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
                dataIndex: 'state'
            }, {
                key: 'lifeCycle',
                title: 'Life Cycle',
                dataIndex: 'lifeCycle'
            },
            {
                key: 'operations',
                title: 'Operations',
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

