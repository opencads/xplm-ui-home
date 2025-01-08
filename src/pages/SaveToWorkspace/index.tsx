import { forwardRef, useEffect } from "react";
import { Flex, useUpdate } from "../../natived";
import { services } from "../../services";
import { dragClass } from "../Home";
import { Button } from "antd";
import { CloseOutlined, MinusOutlined } from "@ant-design/icons";
import { IAgent, RawJson, RawJsonDocument } from "../../IRawJson";
import { TableApp } from "../../apps/TableApp";
import { ColumnsType } from "antd/es/table";
import { IImportInput } from "../../interfaces";

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
        render: (text, record, index) => record.status
    }
];

export const SaveToWorkspace = forwardRef<ISaveToWorkspaceRef, ISaveToWorkspaceProps>((props, ref) => {
    const [reports, updateReports, reportsRef] = useUpdate<IReportRecord[]>([]);
    useEffect(() => {
        let func = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            // 打印所有参数
            for (const [key, value] of urlParams.entries()) {
                console.log(`${key}: ${value}`);
            }
            if (urlParams.has("dataID")) {
                let dataID = urlParams.get("dataID");
                if (dataID) {
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
                        let status = undefined;
                        if (progress.Data?.Success == true) {
                            status = 'succeeded';
                        }
                        else if (progress.Data?.Success == false) {
                            status = 'failed';
                        }
                        let report = {
                            key: `${progress.Scope}.${progress.Progress}`,
                            title: `${progress.Message}`,
                            status: status
                        } as IReportRecord;
                        updateReports([...reports, report]);
                    });
                }

            }
        };
        func();
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
        <Flex direction='column' style={{
            flex: 1
        }}>
            <TableApp columns={ReportColumns} dataSource={reports} style={{
                flex: 1,
                height: 0
            }}>

            </TableApp>
        </Flex>
    </Flex>
});
