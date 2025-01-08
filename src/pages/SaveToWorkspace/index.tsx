import { forwardRef, useEffect } from "react";
import { Flex, useUpdate } from "../../natived";
import { services } from "../../services";
import { dragClass } from "../Home";
import { Button } from "antd";
import { CloseOutlined, MinusOutlined } from "@ant-design/icons";
import { IAgent, RawJson } from "../../IRawJson";
import { TableApp } from "../../apps/TableApp";
import { ColumnsType } from "antd/es/table";

export interface ISaveToWorkspaceProps {

}

export interface ISaveToWorkspaceRef {

}

export interface IReportRecord {
    key: string,
    title: string,
    status: 'todo' | 'doing' | 'succeeded' | 'failed'
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
                }

            }
        };
        func();
    }, []);
    return <Flex direction='column' style={{
        width: '100vw',
        height: '100vh',
    }}>
        <Flex>
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
    </Flex>
});
