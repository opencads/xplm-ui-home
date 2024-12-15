import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Flex, useUpdate } from "../../natived";
import { Button } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { DocumentsApp, IDocumentRecord } from "../../apps/DocumentsApp";
import { services } from "../../services";
import Sidebar from "../../svgs/Sidebar.svg?react";
import Icon from "@ant-design/icons/lib/components/Icon";


export interface IHomeProps {
    style?: React.CSSProperties;
}

export interface IHomeRef {
    refresh: () => Promise<void>
}

export const Home = forwardRef<IHomeRef, IHomeProps>((props, ref) => {
    const [documents, updateDocuments, documentRef] = useUpdate<IDocumentRecord[]>([]);
    const [sidebarVisible, updateSidebarVisible, sidebarVisibleRef] = useUpdate(false);
    let navigate = useNavigate();
    const self = useRef<IHomeRef>({
        refresh: async () => {
            try {
                let documents = await services.getDocumentsFromWorkspace(await services.getDefaultDirectory(), "");
                updateDocuments(documents.Documents);
            }
            catch (e) {
                console.log(e);
            }
        }
    });
    useImperativeHandle(ref, () => self.current);
    useEffect(() => {
        self.current?.refresh();
    }, []);
    return <Flex style={{
        ...props.style,
        backgroundColor: '#f4f4f4'
    }} direction='column'>
        {/* 顶部 */}
        <Flex direction='row' style={{ backgroundColor: '#fff', margin: '0px 0px 2px 0px' }}>
            <Flex style={{ flex: 1 }}>
                <Button type='text' icon={<Sidebar></Sidebar>} onClick={() => {
                    updateSidebarVisible(!sidebarVisible);
                }}></Button>
            </Flex>
            <Flex>
                <Button type='text' icon={<SettingOutlined onClick={() => {
                    // navigate('/settings');
                    let currentUrl = window.location.pathname;
                    services.openUrl(currentUrl + '/settings');
                }} />}></Button>
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
                // overflowY: 'auto'
            }} direction='column'>
                <DocumentsApp data={documents}></DocumentsApp>
            </Flex>
        </Flex>
    </Flex>
});