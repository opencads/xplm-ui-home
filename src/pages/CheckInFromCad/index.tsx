import React, { forwardRef, useEffect, useRef } from "react";
import { Flex, useUpdate } from "../../natived";
import { services } from "../../services";
import { dragClass } from "../Home";
import { Button, Progress, Spin } from "antd";
import { CheckCircleOutlined, CheckOutlined, CloseOutlined, LoadingOutlined, MinusOutlined, WarningOutlined } from "@ant-design/icons";
import { IAgent, RawJson, RawJsonDocument } from "../../IRawJson";
import { TableApp } from "../../apps/TableApp";
import { ColumnsType, TableRef } from "antd/es/table";
import { ICheckInInput, IImportInput } from "../../interfaces";
import Icon from "@ant-design/icons/lib/components/Icon";

export interface ICheckInFromCadProps {

}

export interface ICheckInFromCadRef {

}

export interface IReportRecord {
    key: string,
    title: string,
    dateTime?: string,
    status?: 'todo' | 'doing' | 'success' | 'failed',
    children?: IReportRecord[]
}

export const ReportColumns: ColumnsType<IReportRecord> = [
    {
        key: 'No.',
        title: 'No.',
        width: 50,
        render: (text, record, index) => index + 1
    },
    {
        key: 'title',
        title: 'Title',
        width: 200,
        render: (text, record, index) => record.title
    },
    {
        key: 'DateTime',
        title: 'DateTime',
        width: 150,
        render: (text, record, index) => {
            return record.dateTime
        }
    },
    {
        key: 'status',
        title: 'Status',
        width: 50,
        render: (text, record, index) => {
            if (record.status == 'failed') {
                return <WarningOutlined style={{
                    // 失败颜色
                    color: 'red'
                }} />
            }
            else if (record.status == 'doing') {
                return <LoadingOutlined spin />
            }
            else if (record.status == 'success') {
                return <CheckCircleOutlined />
            }
        }
    }
];

export const CheckInFromCad = forwardRef<ICheckInFromCadRef, ICheckInFromCadProps>((props, ref) => {
    const [reports, updateReports, reportsRef] = useUpdate<IReportRecord[]>([]);
    const [progressValue, updateProgressValue, progressValueRef] = useUpdate(0);
    const tableRef = useRef<TableRef>(null);
    const isAutoScrollToBottom = useRef(true);
    const scrollToBottom = () => {
        let getLastRecprd = (records: IReportRecord[]): IReportRecord => {
            let lastRecord = records[records.length - 1];
            if (lastRecord && lastRecord.children && lastRecord.children.length > 0) {
                return getLastRecprd(lastRecord.children);
            }
            else {
                return lastRecord;
            }
        };
        tableRef.current?.scrollTo({
            key: getLastRecprd(reportsRef.current)?.key
        });
    };
    useEffect(() => {
        if (isAutoScrollToBottom.current) {
            scrollToBottom();
        }
    }, [reports]);
    const self = useRef({
        checkin: async () => {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has("dataID") == false) {
                return;
            }
            let dataID = urlParams.get("dataID");
            if (dataID == null) return;
            let data = await services.getDataByID(dataID) as {
                Agent: IAgent,
                RawJson: RawJson
            };
            let toImportData = {
                Items: []
            } as IImportInput;
            let mapFilePathToDocuments = {} as {
                [key: string]: RawJsonDocument[]
            };
            for (let document of data.RawJson.Documents) {
                let filePath = document.FilePath;
                if (!mapFilePathToDocuments[filePath]) {
                    mapFilePathToDocuments[filePath] = [];
                }
                mapFilePathToDocuments[filePath].push(document);
            }
            for (let filePath in mapFilePathToDocuments) {
                toImportData.Items.push({
                    FilePath: filePath,
                    RawJson: {
                        Documents: mapFilePathToDocuments[filePath]
                    } as any,
                    Agent: data.Agent
                });
            }
            try {
                let nextStepRatio = 0.5;
                let nextStepStart = 0;
                let importResult = await services.importFilesToWorkspaceAsync(toImportData, progress => {
                    let parentReport = reportsRef.current.find(x => x.key == progress.parentID);
                    let lastReport = reportsRef.current.find(x => x.key == progress.id);
                    if (lastReport) {
                        lastReport.status = progress.status;
                        updateReports([...reportsRef.current]);
                    }
                    else if (parentReport) {
                        parentReport.children = [...parentReport.children ?? [], {
                            key: progress.id ?? Math.random().toString(),
                            title: `${progress.message}`,
                            status: progress.status,
                            dateTime: progress.dateTime
                        }] as IReportRecord[];
                        updateReports([...reportsRef.current]);
                    }
                    else {
                        let report = {
                            key: progress.id ?? Math.random().toString(),
                            title: `${progress.message}`,
                            status: progress.status,
                            dateTime: progress.dateTime
                        } as IReportRecord;
                        updateReports([...reportsRef.current, report]);
                    }
                    updateProgressValue(progress.progress * 100 * nextStepRatio);
                });
                let checkInInput = { Items: [] } as ICheckInInput;
                for (let item of importResult) {
                    let localAttributeKeys = Object.keys(item.rawJsonDocument.Attributes ?? {});
                    let localAttributes = [];
                    if (item.rawJsonDocument.Attributes) {
                        for (let key of localAttributeKeys) {
                            localAttributes.push({
                                key: key,
                                value: item.rawJsonDocument.Attributes[key],
                                type: 'string'
                            });
                        }
                    }
                    let localChildren = [];
                    if (item.rawJsonDocument.Children) {
                        for (let child of item.rawJsonDocument.Children) {
                            localChildren.push({
                                name: child.Name,
                                fileName: child.FileName,
                                partNumber: '',
                                number: ''
                            });
                        }
                    }
                    checkInInput.Items.push({
                        FilePath: item.filePath,
                        Document: {
                            key: item.originFileName,
                            name: item.displayName,
                            fileName: item.originFileName,
                            number: item.documentNumber0,
                            partNumber: item.partNumber0,
                            remote: {
                                success: false,
                                remoteState: 'unknown',
                                remoteAttributes: [],
                                remoteChildren: [],
                                remoteLastModifiedTime: '',
                                lifeCycle: ''
                            },
                            local: {
                                success: true,
                                localAttributes: localAttributes,
                                localChildren: localChildren,
                                localFilePath: item.filePath,
                                localLastModifiedTime: item.fileLastWriteTime,
                                workspaceState: 'archived'
                            }
                        }
                    });
                }
                nextStepStart = 50;
                await services.checkinDocumentsAsync(checkInInput, progress => {
                    let parentReport = reportsRef.current.find(x => x.key == progress.parentID);
                    let lastReport = reportsRef.current.find(x => x.key == progress.id);
                    if (lastReport) {
                        lastReport.status = progress.status;
                        updateReports([...reportsRef.current]);
                    }
                    else if (parentReport) {
                        parentReport.children = [...parentReport.children ?? [], {
                            key: progress.id ?? Math.random().toString(),
                            title: `${progress.message}`,
                            status: progress.status,
                            dateTime: progress.dateTime
                        }] as IReportRecord[];
                        updateReports([...reportsRef.current]);
                    }
                    else {
                        let report = {
                            key: progress.id ?? Math.random().toString(),
                            title: `${progress.message}`,
                            status: progress.status,
                            dateTime: progress.dateTime
                        } as IReportRecord;
                        updateReports([...reportsRef.current, report]);
                    }
                    updateProgressValue(nextStepStart + progress.progress * 100 * nextStepRatio);
                });
            }
            catch (e: any) {
                let errorReport = {
                    key: Math.random().toString(),
                    title: e.message,
                    status: 'failed',
                    dateTime: new Date().toLocaleString()
                } as IReportRecord;
                updateReports([...reportsRef.current, errorReport]);
            }
            // 将所有report的status（当为doing时）设置为success
            let formatReports = (records: IReportRecord[]) => {
                for (let record of records) {
                    if (record.status == 'doing') {
                        record.status = 'success';
                    }
                    else if (record.children) {
                        formatReports(record.children);
                    }
                }
            };
            formatReports(reportsRef.current);
            updateProgressValue(100);
            localStorage.setItem('documents.refresh', Math.random().toString());
        }
    });

    useEffect(() => {
        self.current.checkin();
    }, []);
    return <Flex direction='column' style={{
        width: '100vw',
        height: '100vh',
    }}>
        <Flex >
            <Flex horizontalCenter className={dragClass} onMouseDown={e => {
                services.mouseDownDrag();
                e.preventDefault();
                e.stopPropagation();
            }} style={{
                flex: 1,
                userSelect: 'none'
            }}>
                {"Check In"}
            </Flex>
            {/* <Button type='text'
                icon={<MinusOutlined />} onClick={() => {
                    services.minimize();
                }}>
            </Button> */}

        </Flex>
        <TableApp ref={tableRef} columns={ReportColumns} dataSource={reports} style={{
            flex: 1,
            height: 0
        }} disablePagination>
        </TableApp>
        <Flex style={{
            padding: '10px 10px'
        }}>
            <Progress style={{
                flex: 1,
                margin: '0px 10px 0px 20px'
            }} percent={progressValue} showInfo={false}></Progress>
            {progressValue >= 100 ? <CheckOutlined /> : <LoadingOutlined spin />}
        </Flex>
        <Button style={{
            margin: '10px'
        }} disabled={progressValue < 100} onClick={() => {
            services.close();
        }}>{"Close"}</Button>
    </Flex>
});
