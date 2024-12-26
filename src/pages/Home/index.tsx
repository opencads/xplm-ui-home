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

    refreshUserInfo: () => Promise<void>,
    refresh: (showLoading: boolean) => Promise<void>,
    refreshLayoutTabs: () => Promise<void>
}

export interface ILayoutTab {
    key: string,
    icon?: string,
    title: string,
    url: string
}


export const Home = forwardRef<IHomeRef, IHomeProps>((props, ref) => {
    const [sidebarVisible, updateSidebarVisible, sidebarVisibleRef] = useUpdate(false);
    const [loading, updateLoading, loadingRef] = useUpdate(false);
    const [loadingPercent, updateLoadingPercent, loadingPercentRef] = useUpdate<number | undefined>(undefined);
    const [loadingTip, updateLoadingTip, loadingTipRef] = useUpdate('');
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
        refreshUserInfo: async () => {
            let userInfo = await services.getUserInfo();
            updateUserInfo(userInfo);
            localStorage.setItem("login", JSON.stringify(userInfo));
        },
        refresh: async (showLoading: boolean) => {
            if (showLoading) updateLoading(true);
            try {
                await self.current?.refreshLayoutTabs();
                await self.current?.refreshUserInfo();
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
    useImperativeHandle(ref, () => self.current);
    useEffect(() => {
        self.current?.refresh(true);
    }, []);
    useLocalStorageListener("login", data => {
        if (loadingRef.current) return;
        updateUserInfo(JSON.parse(data));
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
        }}>{tab.title}</Button>
    };
    const renderContentByUrl = (tab: ILayoutTab) => {
        if (tab.url.startsWith('/')) {
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

        </Flex>
    </Flex>
});