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
import SelectSvg from "../../svgs/Select.svg?react";
import CancelSvg from "../../svgs/Cancel.svg?react";

export interface IDocumentsAppRef {

}

export interface IDocumentsAppProps {
    style?: React.CSSProperties;
    data: IDocumentRecord[];
    onRefresh?: () => void;
    onArchive?: (records: IDocumentRecord[]) => void;
    onDetail?: (record: IDocumentRecord) => void;
    showLoading?: (loading: boolean) => Promise<void>;
    onImported?: () => Promise<void>;
    onCheckIn?: (records: IDocumentRecord[]) => Promise<void>;
}

export interface IDocumentRecord {
    key: string,
    name: string;
    fileName: string;
    number: string;
    partNumber: string;
    remote: {
        success: boolean;
        remoteState: 'new' | 'checkedIn' | 'checkedOut' | 'unknown';
        remoteLastModifiedTime: string;
        lifeCycle: string;
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
        raw?: any
    },
    local: {
        success: boolean;
        workspaceState: 'untracked' | 'modified' | 'archived' | 'missing' | 'todownload';
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
        raw?: any
    };
}

export const DocumentsApp = forwardRef<IDocumentsAppRef, IDocumentsAppProps>(
    (props, ref) => {
        const renderRemoteState = (state: IDocumentRecord["remote"]["remoteState"]) => {
            if (state == 'new') {
                return <Tag>New</Tag>;
            } else if (state == 'checkedIn') {
                return <Tag>Checked In</Tag>;
            } else if (state == 'unknown') {
                return <Tag color='#f50'>Unknown</Tag>;
            }
            else if (state == 'checkedOut') {
                return <Tag>Checked Out</Tag>;
            }

        };
        const renderLocalState = (state: IDocumentRecord["local"]["workspaceState"]) => {
            if (state == 'untracked') {
                return <Tag color='#f50'>Untracked</Tag>;
            } else if (state == 'modified') {
                return <Tag color='geekblue'>Modified</Tag>;
            } else if (state == 'archived') {
                return <Tag color='green'>Archived</Tag>;
            }
            else if (state == 'missing') {
                return <Tag color='red'>Missing</Tag>;
            }
            else if (state == 'todownload') {
                return <Tag color='volcano'>To Download</Tag>;
            }
        };
        const [messageApi, contextHolder] = useMessage();
        const [canSelect, updateCanSelect] = useUpdate(false);
        const [selectKeys, updateSelectKeys] = useUpdate<React.Key[]>([]);
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
                        {renderRemoteState(record.remote.remoteState)}
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
                        {record.remote.remoteState != 'checkedIn' && record.remote.remoteState != 'unknown' && record.local.localFilePath.length > 0 && record.local.workspaceState != 'missing' ? <Button type='text' icon={<CheckInSvg />} onClick={async () => {
                            props.onCheckIn?.([record]);
                        }}>{"Check In"}</Button> : undefined}
                        {record.remote.remoteState == 'checkedIn' ? <Button type='text' icon={<CheckOutSvg />}>{"Check Out"}</Button> : undefined}
                        <Button onClick={() => {
                            props.onDetail?.(record);
                        }} type='text' icon={<DetailSvg />}>{"Detail"}</Button>
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
                    <Button type='text' icon={<ArchiveSvg />} onClick={() => {
                        if (canSelect) {
                            props.onArchive?.(props.data.filter((record) => selectKeys.includes(record.key)).filter(record => record.local.success));
                        }
                        else {
                            props.onArchive?.(props.data.filter(record => record.local.success));
                        }
                    }}>{"Archive"}</Button>
                    <Button type="text" icon={canSelect ? <CancelSvg /> : <SelectSvg />} onClick={() => {
                        updateCanSelect(!canSelect);
                    }}>{canSelect ? "Cancel" : "Select"}</Button>
                    <Button type="text" disabled={!canSelect} icon={<CheckInSvg></CheckInSvg>} onClick={() => {
                        props.onCheckIn?.(props.data.filter((record) => selectKeys.includes(record.key)).filter(record => record.local.success));
                    }}>{"CheckIn"}</Button>
                </Flex>
                <Flex>
                    <Button type='text' icon={<ReloadOutlined />} onClick={props.onRefresh}>{"Refresh"}</Button>
                </Flex>
            </Flex>
            <TableApp rowSelection={canSelect ? {
                selectedRowKeys: selectKeys,
                onChange: (keys) => {
                    updateSelectKeys(keys);
                }
            } : undefined} style={{
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

