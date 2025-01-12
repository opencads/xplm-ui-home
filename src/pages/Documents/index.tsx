import { forwardRef, useEffect, useRef } from "react";
import { Flex, useUpdate } from "../../natived";
import { DocumentsApp, IDocumentRecord } from "../../apps/DocumentsApp";
import { Button, Spin } from "antd";
import { services } from "../../services";
import { ICheckInInput, IImportInput } from "../../interfaces";
import { IMarkdownLine, MarkdownApp } from "../../apps/MarkdownApp";
import { ResizeButton } from "../../uilibs/ResizeButton";
import { MinusOutlined } from "@ant-design/icons";
import { useLocalStorageListener } from "../../utils";

export interface IDocumentsRef {

}

export interface IDocumentProps {

}

export const globalRefreshDocuments = () => {
    localStorage.setItem('documents.refresh', new Date().getTime().toString());
}

export const Documents = forwardRef<IDocumentsRef, IDocumentProps>((props, ref) => {
    const [detailsDelta, updateDetailsDelta, detailsDeltaRef] = useUpdate(0);
    const [showDetails, updateShowDetails] = useUpdate(false);
    const [documents, updateDocuments, documentRef] = useUpdate<IDocumentRecord[]>([]);
    const [loading, updateLoading, loadingRef] = useUpdate(false);
    const [loadingPercent, updateLoadingPercent, loadingPercentRef] = useUpdate<number | undefined>(undefined);
    const [loadingTip, updateLoadingTip, loadingTipRef] = useUpdate('');
    const [detailsMarkdownLines, updateDetailsMarkdownLines, detailsMarkdownLinesRef] = useUpdate<IMarkdownLine[]>([]);
    const self = useRef({
        refreshDocuments: async (showLoading: boolean) => {
            if (showLoading) updateLoading(true);
            try {
                let documents = await services.getDocumentsFromWorkspaceAsync(await services.getDefaultDirectory(), "", progress => {
                    updateLoadingPercent(progress.progress * 100);
                    updateLoadingTip(progress.message ?? "");
                });
                updateDocuments(documents.Documents);
            }
            catch (e) {
                console.log(e);
            }
            if (showLoading) {
                updateLoading(false);
            }
            updateLoadingPercent(undefined);
            updateLoadingTip("");
        },
        archive: async (showLoading: boolean) => {
            if (showLoading) updateLoading(true);
            try {
                let documents = await services.getDocumentsFromWorkspace(await services.getDefaultDirectory(), "");
                let imports = {
                    Items: []
                } as IImportInput;
                for (let document of documents.Documents) {
                    if (document.local.workspaceState == 'untracked') {
                        imports.Items.push({
                            FilePath: document.local.localFilePath
                        });
                    }
                    else if (document.local.workspaceState == 'modified') {
                        imports.Items.push({
                            FilePath: document.local.localFilePath
                        });
                    }
                }
                await services.importFilesToWorkspace(imports);
            }
            catch (e) {

            }
            if (showLoading) {
                updateLoading(false);
            }
        },
        checkIn: async (records: IDocumentRecord[], showLoading: boolean) => {
            if (showLoading) updateLoading(true);
            try {
                let checkInInput = {
                    Items: []
                } as ICheckInInput;
                for (let record of records) {
                    checkInInput.Items.push({
                        FilePath: record.local.localFilePath,
                        Document: record
                    });
                }
                // await services.checkinDocuments(checkInInput);
                await services.openwithdata("/easyplm-ui-home/check-in-from-workbench", {
                    "x": "center",
                    "y": "center",
                    "width": "60%",
                    "height": "60%"
                }, checkInInput);
            }
            catch (e) {
                console.log(e);
            }
            if (showLoading) {
                updateLoading(false);
            }
        },
        download: async (records: IDocumentRecord[], showLoading: boolean) => {
            if (showLoading) updateLoading(true);
            try {
                await services.openwithdata("/easyplm-ui-home/download-from-workbench", {
                    "x": "center",
                    "y": "center",
                    "width": "60%",
                    "height": "60%"
                }, records);
            }
            catch (e) {
                console.log(e);
            }
            if (showLoading) {
                updateLoading(false);
            }
        }
    });
    useEffect(() => {
        self.current.refreshDocuments(true);
    }, []);
    useLocalStorageListener("login", data => {
        if (loadingRef.current) return;
        self.current.refreshDocuments(true);
    });
    useLocalStorageListener("documents.refresh", data => {
        if (loadingRef.current) return;
        self.current.refreshDocuments(true);
    });
    const createDetails = (record: IDocumentRecord) => {
        let result = [] as IMarkdownLine[];
        result.push(`## ${record.name}`);
        if (record.remote.remoteAttributes.length > 0) {
            result.push(`### Remote Attributes`);
            result.push({
                type: 'card',
                children: [{
                    type: 'table',
                    valueKey: 'remoteAttributes',
                    tableOptions: {
                        add: false,
                        remove: false,
                        keys: ["key", "value"],
                        defaultType: 'text'
                    },
                    defaultValue: record.remote.remoteAttributes
                }]
            });
        }
        if (record.local?.localAttributes.length > 0) {
            result.push(`### Local Attributes`);
            result.push({
                type: 'card',
                children: [{
                    type: 'table',
                    valueKey: 'localAttributes',
                    tableOptions: {
                        add: false,
                        remove: false,
                        keys: ["key", "value"],
                        defaultType: 'text'
                    },
                    defaultValue: record.local.localAttributes
                }]
            });
        }
        if (record.remote.remoteChildren.length > 0) {
            result.push(`### Remote Children`);
            result.push({
                type: 'card',
                children: [{
                    type: 'table',
                    valueKey: 'localChildren',
                    tableOptions: {
                        add: false,
                        remove: false,
                        keys: ["fileName", "name", "number", "partNumber"],
                        defaultType: 'text'
                    },
                    defaultValue: record.remote.remoteChildren
                }]
            });
        }
        if (record.local?.localChildren.length > 0) {
            result.push(`### Local Children`);
            result.push({
                type: 'card',
                children: [{
                    type: 'table',
                    valueKey: 'localChildren',
                    tableOptions: {
                        add: false,
                        remove: false,
                        keys: ["fileName", "name", "number", "partNumber"],
                        defaultType: 'text'
                    },
                    defaultValue: record.local?.localChildren
                }]
            });
        }
        return result;
    };
    return <Flex direction='column' style={{
        width: '100vw',
        height: '100vh'
    }}>
        <Spin size={'large'} tip={<div style={{
            marginTop: '32px'
        }}>{loadingTip}</div>} percent={loadingPercent} spinning={loading} fullscreen></Spin>
        <Flex style={{
            flex: 1,
            height: 0
        }}>
            <DocumentsApp style={{
                flex: 1,
                width: 0
            }} onDetail={record => {
                updateDetailsMarkdownLines(createDetails(record));
                updateShowDetails(true);
            }} data={documents} onRefresh={() => self.current.refreshDocuments(true)} onArchive={async () => {
                updateLoading(true);
                try {
                    await self.current.archive(false);
                    await self.current.refreshDocuments(false);
                }
                catch {

                }
                updateLoading(false);
            }} onImported={async () => {
                await self.current.refreshDocuments(false);
            }} onCheckIn={async records => {
                updateLoading(true);
                try {
                    await self.current.checkIn(records, false);
                    // await self.current.refreshDocuments(false);
                }
                catch {

                }
                updateLoading(false);
            }} onDownload={async records => {
                await self.current.download(records, true);
            }}></DocumentsApp>
            <ResizeButton style={{
                display: showDetails ? 'flex' : 'none'
            }} onDeltaChange={updateDetailsDelta}></ResizeButton>
            <Flex direction='column' style={{
                backgroundColor: '#fff',
                display: showDetails ? 'flex' : 'none',
                margin: '0px 0px 0px 0px',
                width: `calc(35% - ${detailsDelta}px)`
            }}>
                <Flex direction='row'>
                    <Flex style={{ flex: 1 }}></Flex>
                    <Flex>
                        <Button type='text' icon={<MinusOutlined />} onClick={() => {
                            updateShowDetails(false);
                        }}></Button>
                    </Flex>
                </Flex>
                <MarkdownApp style={{
                    flex: 1,
                    height: 0,
                    overflowY: 'auto',
                    padding: '0px 10px'
                }} markdownLines={detailsMarkdownLines}></MarkdownApp>
            </Flex>
        </Flex>

    </Flex>;
});