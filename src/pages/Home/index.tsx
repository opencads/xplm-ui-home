import React, { ReactNode, forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Flex, InjectClass, useUpdate } from "../../natived";
import { Avatar, Button, Spin } from "antd";
import { CloseOutlined, MinusOutlined, SettingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { DocumentsApp, IDocumentRecord } from "../../apps/DocumentsApp";
import { services } from "../../services";
import SidebarSvg from "../../svgs/Sidebar.svg?react";
import Icon from "@ant-design/icons/lib/components/Icon";
import { ICheckInInput, IImportInput, IUserInfomation } from "../../interfaces";
import { ResizeButton } from "../../uilibs/ResizeButton";
import { IMarkdownAppRef, IMarkdownLine, MarkdownApp, MarkdownLine } from "../../apps/MarkdownApp";
import { UserAvatarApp } from "../../apps/UserAvatarApp";
import { useLocalStorageListener } from "../../utils";
import DocumentsSvg from "../../svgs/Documents.svg?react"
import WorkspacesSvg from "../../svgs/Workspaces.svg?react"

export const dragClass = InjectClass(`
-webkit-app-region: drag;
`);

export interface IHomeProps {
    style?: React.CSSProperties;
}

export interface IHomeRef {
    refreshDocuments: (showLoading: boolean) => Promise<void>,
    archive: (showLoading: boolean) => Promise<void>,
    refreshUserInfo: () => Promise<void>,
    refresh: (showLoading: boolean) => Promise<void>,
    checkIn: (records: IDocumentRecord[], showLoading: boolean) => Promise<void>,
    refreshLayoutTabs: () => Promise<void>
}

export interface ILayoutTab {
    key: string,
    icon?: string,
    title: string,
    url: string
}


export const Home = forwardRef<IHomeRef, IHomeProps>((props, ref) => {
    const [documents, updateDocuments, documentRef] = useUpdate<IDocumentRecord[]>([]);
    const [sidebarVisible, updateSidebarVisible, sidebarVisibleRef] = useUpdate(false);
    const [loading, updateLoading, loadingRef] = useUpdate(false);
    const [loadingPercent, updateLoadingPercent, loadingPercentRef] = useUpdate<number | undefined>(undefined);
    const [loadingTip, updateLoadingTip, loadingTipRef] = useUpdate('');
    const [detailsDelta, updateDetailsDelta, detailsDeltaRef] = useUpdate(0);
    const [showDetails, updateShowDetails] = useUpdate(false);
    const [detailsMarkdownLines, updateDetailsMarkdownLines, detailsMarkdownLinesRef] = useUpdate<IMarkdownLine[]>([]);
    const [userInfo, updateUserInfo] = useUpdate<IUserInfomation>({
        isLogin: false
    });
    const [layoutTabs, updateLayoutTabs] = useUpdate<ILayoutTab[]>([]);
    const [currentTab, updateCurrentTab] = useUpdate<string>("documents");
    let navigate = useNavigate();
    const tryAll = async (tasks: Promise<any>[]) => {
        for (let task of tasks) {
            try {
                await task;
            }
            catch (e) {
                console.log(e);
            }
        }
    }
    const self = useRef<IHomeRef>({
        refreshDocuments: async (showLoading: boolean) => {
            if (showLoading) updateLoading(true);
            try {
                let documents = await services.getDocumentsFromWorkspaceAsync(await services.getDefaultDirectory(), "", progress => {
                    updateLoadingPercent(progress.Progress * 100);
                    updateLoadingTip(progress.Message);
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
        refreshUserInfo: async () => {
            let userInfo = await services.getUserInfo();
            updateUserInfo(userInfo);
            localStorage.setItem("login", JSON.stringify(userInfo));
        },
        refresh: async (showLoading: boolean) => {
            if (showLoading) updateLoading(true);
            try {
                await self.current?.refreshLayoutTabs();
                let task1 = self.current?.refreshUserInfo();
                let task2 = self.current?.refreshDocuments(false);
                await tryAll([task1, task2]);
            }
            catch (e) {
                console.log(e);
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
                        FilePath: record.local.localFilePath
                    });
                }
                await services.checkinDocuments(checkInInput);
            }
            catch (e) {
                console.log(e);
            }
            if (showLoading) {
                updateLoading(false);
            }
        },
        refreshLayoutTabs: async () => {
            let layout = await services.getLayout();
            updateLayoutTabs(layout.tabs ?? []);
        }
    });
    const contentsCache = useRef<JSX.Element[]>([]);
    useImperativeHandle(ref, () => self.current);
    useEffect(() => {
        self.current?.refresh(true);
    }, []);
    useLocalStorageListener("login", data => {
        if (loadingRef.current) return;
        updateUserInfo(JSON.parse(data));
        self.current?.refreshDocuments(true);
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
    const renderIcon = (icon?: string) => {
        if (icon == "documents") return <DocumentsSvg></DocumentsSvg>;
        else if (icon == "workspaces") return <WorkspacesSvg></WorkspacesSvg>
        else return <></>;
    };
    const renderTab = (tab: ILayoutTab) => {
        return <Button style={{
            backgroundColor: tab.key == currentTab ? '#e6f7ff' : undefined
        }} type='text' icon={renderIcon(tab.icon)} onClick={() => {
            updateCurrentTab(tab.key);
            updateDetailsMarkdownLines([]);
        }}>{tab.title}</Button>
    };
    const renderContentByUrl = (tab: ILayoutTab) => {
        if (tab.url == "native://documents") return <DocumentsApp key={tab.url} style={{
            flex: 1,
            height: 0,
            display: currentTab == tab.key ? undefined : 'none'
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
                await self.current.refreshDocuments(false);
            }
            catch {

            }
            updateLoading(false);
        }}></DocumentsApp>
        else if (tab.url.startsWith('/')) {
            return <iframe key={tab.url} src={tab.url} style={{
                flex: 1,
                height: 0,
                border: 'none',
                display: currentTab == tab.key ? undefined : 'none'
            }}></iframe>
        }
    };

    return <Flex style={{
        ...props.style,
        backgroundColor: '#f4f4f4'
    }} direction='column'>
        <Spin size={'large'} tip={<div style={{
            marginTop: '32px'
        }}>{loadingTip}</div>} percent={loadingPercent} spinning={loading} fullscreen></Spin>
        {/* 顶部 */}
        <Flex direction='row' style={{ backgroundColor: '#fff', margin: '0px 0px 2px 0px', padding: '0px 0px 0px 4px' }}>
            <Flex verticalCenter>
                <Button type='text' icon={<SidebarSvg></SidebarSvg>} onClick={() => {
                    updateSidebarVisible(!sidebarVisible);
                }}></Button>
                <UserAvatarApp onLogout={async () => {
                    updateLoading(true);
                    try {
                        await services.logout();
                        updateUserInfo({
                            isLogin: false
                        });
                    }
                    catch (e: any) {
                        console.log(e);
                    }
                    updateLoading(false);
                }} style={{ padding: '0px 4px' }} info={userInfo}></UserAvatarApp>
            </Flex>
            <Flex className={dragClass} onMouseDown={e => {
                services.mouseDownDrag();
                e.preventDefault();
                e.stopPropagation();
            }} style={{
                flex: 1,
                userSelect: 'none'
            }}>

            </Flex>
            <Flex spacing={'4px'}>
                <Button type='text' icon={<SettingOutlined />} onClick={() => {
                    let currentUrl = window.location.pathname;
                    services.openUrl(currentUrl + '/settings', {
                        x: 'center',
                        y: "center",
                        width: '80%',
                        height: '80%'
                    });
                }}>{"Settings"}</Button>
                <Button type='text' icon={<CloseOutlined />} onClick={() => {
                    services.close();
                }}>{"Close"}</Button>
            </Flex>
        </Flex>
        {/* 主体 */}
        <Flex style={{
            flex: 1,
            height: 0
        }} direction='row'>
            {/* 侧边 */}
            <Flex style={{
                width: '120px',
                backgroundColor: '#fff',
                margin: '0px 2px 0px 0px',
                display: sidebarVisible ? 'flex' : 'none',
                padding: '0px 4px',
                alignItems: 'start'
            }} direction='column' spacing={'8px'} spacingStart={'4px'}>
                {layoutTabs.map(tab => renderTab(tab))}
            </Flex>
            {/* 内容 */}
            <Flex style={{
                flex: 1,
                width: 0,
                backgroundColor: '#fff',
                padding: '4px'
            }} direction='column'>
                {layoutTabs.map(item => renderContentByUrl(item))}
            </Flex>
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
    </Flex>
});