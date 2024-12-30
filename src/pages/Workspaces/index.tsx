import { forwardRef, useEffect, useRef } from "react";
import { IWorkspaceRecord, WorkspacesApp } from "../../apps/WorkspacesApp";
import { Flex, useUpdate } from "../../natived";
import { services } from "../../services";
import { Spin } from "antd";
import { useLocalStorageListener } from "../../utils";
import { globalRefreshDocuments } from "../Documents";

export interface IWorkspaceProps {

}

export interface IWorkspaceRef {

}

export const globalRefreshWorkspaces = () => {
    localStorage.setItem('workspaces.refresh', (new Date()).getTime().toString());
}

export const Workspace = forwardRef<IWorkspaceRef, IWorkspaceProps>((props: IWorkspaceProps, ref) => {
    const [workspaces, updateWorkspaces, workspacesRef] = useUpdate<IWorkspaceRecord[]>([]);
    const [loading, updateLoading, loadingRef] = useUpdate(false);
    const [loadingPercent, updateLoadingPercent, loadingPercentRef] = useUpdate<number | undefined>(undefined);
    const [loadingTip, updateLoadingTip, loadingTipRef] = useUpdate('');
    const self = useRef({
        refreshWorkspaces: async (showLoading: boolean) => {
            if (showLoading) {
                updateLoading(true);
            }
            try {
                let workspaces = await services.getRemoteWorkspaces();
                updateWorkspaces(workspaces);
            }
            catch (e) {
                console.log(e);
            }

            if (showLoading) {
                updateLoading(false);
            }
        },
        activeWorkspace: async (showLoading: boolean, workspaceRecord: IWorkspaceRecord) => {
            if (workspaceRecord.active) return;
            if (showLoading) {
                updateLoading(true);
            }
            try {
                await services.activeRemoteWorkspaces(workspaceRecord);
                let lastActiveWorkspace = workspacesRef.current.find(w => w.active);
                let temp = [...workspacesRef.current];
                temp.forEach(workspace => {
                    workspace.active = workspaceRecord.key === workspace.key;
                });
                updateWorkspaces(temp);
                if (lastActiveWorkspace) {
                    if (lastActiveWorkspace.key != workspaceRecord.key) {
                        globalRefreshDocuments();
                    }
                }

            }
            catch (e) {
                console.log(e);
            }

            if (showLoading) {
                updateLoading(false);
            }
        },
        createWorkspace: async () => {
            try {
                let currentUrl = window.location.pathname;
                let lastSplitChar = currentUrl.lastIndexOf('/');
                currentUrl = currentUrl.substring(0, lastSplitChar);
                services.openUrl(currentUrl + '/create-workspace', {
                    x: 'center',
                    y: "center",
                    width: '40%',
                    height: '80%'
                });
            }
            catch (e) {
                console.log(e);
            }
        },
        deleteWorkspace: async (showLoading: boolean, workspaceRecord: IWorkspaceRecord) => {
            if (showLoading) {
                updateLoading(true);
            }
            try {
                await services.deleteRemoteWorkspace(workspaceRecord);
                let lastActiveWorkspace = workspacesRef.current.find(w => w.active);
                let temp = [...workspacesRef.current];
                temp.splice(temp.findIndex(w => w.key === workspaceRecord.key), 1);
                updateWorkspaces(temp);
                if (lastActiveWorkspace) {
                    if (lastActiveWorkspace.key != workspaceRecord.key) {
                        globalRefreshDocuments();
                    }
                }
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
        self.current.refreshWorkspaces(true);
    }, []);
    useLocalStorageListener('workspaces.refresh', data => {
        self.current.refreshWorkspaces(true);
    });
    return <Flex direction='column' style={{
        width: '100vw',
        height: '100vh',
    }}>
        <Spin size={'large'} tip={<div style={{
            marginTop: '32px'
        }}>{loadingTip}</div>} percent={loadingPercent} spinning={loading} fullscreen></Spin>
        <WorkspacesApp style={{
            flex: 1,
            height: 0
        }} workspaces={workspaces} onActive={record => {
            self.current.activeWorkspace(true, record);
        }} onRefresh={() => {
            self.current.refreshWorkspaces(true);
        }} onNew={() => {
            self.current.createWorkspace();
        }} onDelete={record => {
            self.current.deleteWorkspace(true, record);
        }} />
    </Flex>
});