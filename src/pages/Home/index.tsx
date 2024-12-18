import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Flex, InjectClass, useUpdate } from "../../natived";
import { Avatar, Button, Spin } from "antd";
import { CloseOutlined, MinusOutlined, SettingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { DocumentsApp, IDocumentRecord } from "../../apps/DocumentsApp";
import { services } from "../../services";
import SidebarSvg from "../../svgs/Sidebar.svg?react";
import Icon from "@ant-design/icons/lib/components/Icon";
import { IImportInput, IUserInfomation } from "../../interfaces";
import { ResizeButton } from "../../uilibs/ResizeButton";
import { IMarkdownAppRef, IMarkdownLine, MarkdownApp, MarkdownLine } from "../../apps/MarkdownApp";
import { UserAvatarApp } from "../../apps/UserAvatarApp";

export const dragClass = InjectClass(`
-webkit-app-region: drag;
`);

export interface IHomeProps {
    style?: React.CSSProperties;
}

export interface IHomeRef {
    refresh: (showLoading: boolean) => Promise<void>,
    archive: (showLoading: boolean) => Promise<void>,
    refreshUserInfo: () => Promise<void>
}

export const Home = forwardRef<IHomeRef, IHomeProps>((props, ref) => {
    const [documents, updateDocuments, documentRef] = useUpdate<IDocumentRecord[]>([]);
    const [sidebarVisible, updateSidebarVisible, sidebarVisibleRef] = useUpdate(false);
    const [loading, updateLoading, loadingRef] = useUpdate(false);
    const [detailsDelta, updateDetailsDelta, detailsDeltaRef] = useUpdate(0);
    const [showDetails, updateShowDetails] = useUpdate(false);
    const [detailsMarkdownLines, updateDetailsMarkdownLines, detailsMarkdownLinesRef] = useUpdate<IMarkdownLine[]>([]);
    const [userInfo, updateUserInfo] = useUpdate<IUserInfomation>({
        isLogin: false
    });
    let navigate = useNavigate();
    const markdownAppRef = useRef<IMarkdownAppRef>(null);
    const self = useRef<IHomeRef>({
        refresh: async (showLoading: boolean) => {
            if (showLoading) updateLoading(true);
            try {
                let documents = await services.getDocumentsFromWorkspace(await services.getDefaultDirectory(), "");
                updateDocuments(documents.Documents);
            }
            catch (e) {
                console.log(e);
            }
            if (showLoading) updateLoading(false);
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
            if (showLoading) updateLoading(false);
        },
        refreshUserInfo: async () => {
            let userInfo = await services.getLoginInfo();
            updateUserInfo(userInfo);
        }
    });
    useImperativeHandle(ref, () => self.current);
    useEffect(() => {
        let func = async () => {
            updateLoading(true);
            try {
                let task1 = self.current?.refreshUserInfo();
                let task2 = self.current?.refresh(false);
                await Promise.all([task1, task2]);
            }
            catch {

            }
            updateLoading(false);
        }
        func();
    }, []);
    const createDetails = (record: IDocumentRecord) => {
        let result = [] as IMarkdownLine[];
        result.push(`## ${record.name}`);
        if (record.remoteAttributes.length > 0) {
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
                    defaultValue: record.remoteAttributes
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
        if (record.remoteChildren.length > 0) {
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
                    defaultValue: record.remoteChildren
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
    return <Flex style={{
        ...props.style,
        backgroundColor: '#f4f4f4'
    }} direction='column'>
        <Spin spinning={loading} fullscreen></Spin>
        {/* 顶部 */}
        <Flex direction='row' style={{ backgroundColor: '#fff', margin: '0px 0px 2px 0px', padding: '0px 0px 0px 4px' }}>
            <Flex verticalCenter>
                <Button type='text' icon={<SidebarSvg></SidebarSvg>} onClick={() => {
                    updateSidebarVisible(!sidebarVisible);
                }}>{"Sidebar"}</Button>
                <UserAvatarApp style={{ padding: '0px 4px' }} info={userInfo}></UserAvatarApp>
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
                    services.openUrl(currentUrl + '/settings');
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
                width: '100px',
                backgroundColor: '#fff',
                margin: '0px 2px 0px 0px',
                display: sidebarVisible ? 'flex' : 'none'
            }} direction='column'></Flex>
            {/* 内容 */}
            <Flex style={{
                flex: 1,
                width: 0,
                backgroundColor: '#fff',
                padding: '4px'
            }} direction='column'>
                <DocumentsApp style={{
                    flex: 1,
                    height: 0
                }} ref={markdownAppRef} onRecordClick={record => {
                    updateDetailsMarkdownLines(createDetails(record));
                    updateShowDetails(true);
                }} data={documents} onRefresh={() => self.current.refresh(true)} onArchive={async () => {
                    updateLoading(true);
                    try {
                        await self.current.archive(false);
                        await self.current.refresh(false);
                    }
                    catch {

                    }
                    updateLoading(false);
                }} onImported={async () => {
                    await self.current.refresh(false);
                }}></DocumentsApp>
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