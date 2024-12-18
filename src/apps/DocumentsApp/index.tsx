import { forwardRef } from "react";
import { Flex, useUpdate } from "../../natived";
import { ImportFileApp } from "../ImportFileApp";
import useMessage from "antd/es/message/useMessage";
import { Button, Spin, Table, TableColumnsType, Tag } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import ArchiveSvg from "../../svgs/Archive.svg?react";
import { TableApp } from "../TableApp";
import CheckInSvg from "../../svgs/CheckIn.svg?react";
import CheckOutSvg from "../../svgs/CheckOut.svg?react";
import DetailSvg from "../../svgs/Detail.svg?react";

export interface IDocumentsAppRef {

}

export interface IDocumentsAppProps {
    style?: React.CSSProperties;
    data: IDocumentRecord[];
    onRefresh?: () => void;
    onArchive?: () => void;
    onRecordClick?: (record: IDocumentRecord) => void;
    showLoading?: (loading: boolean) => Promise<void>;
    onImported?: () => Promise<void>;
}

export interface IDocumentRecord {
    name: string;
    fileName: string;
    number: string;
    partNumber: string;
    remoteState: 'new' | 'checkedIn' | 'checkedOut' | 'unknown';
    remoteLastModifiedTime: string;
    lifeCycle: string;
    local: {
        workspaceState: 'untracked' | 'modified' | 'archived' | 'missing';
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
                return <Tag>New</Tag>;
            } else if (state == 'checkedIn') {
                return <Tag>Checked In</Tag>;
            } else if (state == 'unknown') {
                return <Tag>Unknown</Tag>;
            }
            else if (state == 'checkedOut') {
                return <Tag>Checked Out</Tag>;
            }

        };
        const renderLocalState = (state: IDocumentRecord["local"]["workspaceState"]) => {
            if (state == 'untracked') {
                return <Tag>Untracked</Tag>;
            } else if (state == 'modified') {
                return <Tag>Modified</Tag>;
            } else if (state == 'archived') {
                return <Tag>Archived</Tag>;
            }
            else if (state == 'missing') {
                return <Tag>Missing</Tag>;
            }
        };
        const [messageApi, contextHolder] = useMessage();
        const columns: TableColumnsType<IDocumentRecord> = [
            {
                key: 'No.',
                title: 'No.',
                fixed: 'left',
                width: '5em',
                render: (text, record, index) => {
                    return index + 1;
                }
            }, {
                key: 'name',
                title: 'Name',
                dataIndex: 'name',
                width: '12em',
            }, {
                key: 'number',
                title: 'Number',
                dataIndex: 'number',
                width: '12em'
            }, {
                key: 'partNumber',
                title: 'Part Number',
                dataIndex: 'partNumber',
                width: '12em'
            }, {
                key: 'state',
                title: 'State',
                width: '8em',
                render: (text, record) => {
                    return <Flex spacing={'4px'}>
                        {renderRemoteState(record.remoteState)}
                        {renderLocalState(record.local.workspaceState)}
                    </Flex>
                }
            }, {
                key: 'lifeCycle',
                title: 'Life Cycle',
                dataIndex: 'lifeCycle',
                width: '12em'
            },
            {
                key: 'operations',
                title: 'Operations',
                fixed: 'right',
                render: (text, record) => {
                    return <Flex spacing={'4px'}>
                        <Button type='text' icon={<CheckInSvg/>}>{"Check In"}</Button>
                        <Button type='text' icon={<CheckOutSvg />}>{"Check Out"}</Button>
                        <Button type='text' icon={<DetailSvg />}>{"Check Out"}</Button>
                    </Flex>
                }
            },
            {
                key: 'other',
                title: ''
            }
        ];
        return <Flex direction='column' spacing={'4px'} style={props.style}>
            {contextHolder}
            <Flex>
                <Flex style={{ flex: 1 }} spacing={'8px'}>
                    <ImportFileApp onImported={props.onImported} showLoading={props.showLoading} messageApi={messageApi} />
                    <Button type='text' icon={<ArchiveSvg />} onClick={props.onArchive}>{"Archive"}</Button>
                </Flex>
                <Flex>
                    <Button type='text' icon={<ReloadOutlined />} onClick={props.onRefresh}>{"Refresh"}</Button>
                </Flex>
            </Flex>
            <TableApp style={{
                flex: 1,
                height: 0
            }} scroll={{
                x: "max-content"
            }} onRow={(record) => {
                return {
                    // onClick: () => props.onRecordClick?.(record)
                }
            }} dataSource={props.data} columns={columns} ></TableApp>
        </Flex>
    },
);

