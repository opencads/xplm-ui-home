import { forwardRef, useEffect, useRef } from "react";
import { Flex, useUpdate } from "../../natived";
import { services } from "../../services";
import { dragClass } from "../Home";
import { Button, Progress, Spin } from "antd";
import { CloseOutlined, LoadingOutlined, MinusOutlined, WarningOutlined } from "@ant-design/icons";
import { IAgent, RawJson, RawJsonDocument } from "../../IRawJson";
import { TableApp } from "../../apps/TableApp";
import { ColumnsType } from "antd/es/table";
import { IImportInput } from "../../interfaces";
import Icon from "@ant-design/icons/lib/components/Icon";

export interface ISaveToWorkspaceProps {

}

export interface ISaveToWorkspaceRef {

}

export interface IReportRecord {
    key: string,
    title: string,
    status?: 'todo' | 'doing' | 'succeeded' | 'failed'
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
        title: 'title',
        width: 200,
        render: (text, record, index) => record.title
    },
    {
        key: 'status',
        title: 'status',
        width: 200,
        render: (text, record, index) => {
            if (record.status == 'failed') {
                return <WarningOutlined style={{
                    // 失败颜色
                    color: 'red'
                }} />
            }
        }
    }
];

export const SaveToWorkspace = forwardRef<ISaveToWorkspaceRef, ISaveToWorkspaceProps>((props, ref) => {
    const [reports, updateReports, reportsRef] = useUpdate<IReportRecord[]>([]);
    const [progressValue, updateProgressValue, progressValueRef] = useUpdate(0);
    const self = useRef({
        saveToWorkspace: async () => {
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
                    } as any
                });
            }
            await services.importFilesToWorkspaceAsync(toImportData, progress => {
                let status = progress.Data?.Status;
                let report = {
                    key: `${progress.Scope}.${progress.Progress}`,
                    title: `${progress.Message}`,
                    status: status
                } as IReportRecord;
                updateProgressValue(progress.Progress * 100);
                updateReports([...reports, report]);
            });
            updateProgressValue(100);
        }
    });
    useEffect(() => {
        self.current.saveToWorkspace();
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
                {"Save To Workspace"}
            </Flex>
            <Button type='text'
                icon={<MinusOutlined />} onClick={() => {
                    services.minimize();
                }}>
            </Button>

        </Flex>
        <Flex>
            <Progress style={{
                flex: 1
            }} percent={progressValue} showInfo={false}></Progress>
            <Spin indicator={<LoadingOutlined spin />} percent={progressValue == 100 ? progressValue : undefined} />
        </Flex>
        <TableApp columns={ReportColumns} dataSource={reports} style={{
            flex: 1,
            height: 0
        }}>
        </TableApp>

    </Flex>
});
