import { forwardRef, useEffect, useRef } from "react";
import { IWorkspaceRecord, WorkspacesApp } from "../../apps/WorkspacesApp";
import { Flex, useUpdate } from "../../natived";
import { services } from "../../services";
import { Spin } from "antd";

export interface IWorkspaceProps {

}

export interface IWorkspaceRef {

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
                let temp = [...workspacesRef.current];
                temp.forEach(workspace => {
                    workspace.active = workspaceRecord.key === workspace.key;
                });
                updateWorkspaces(temp);
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
    return <Flex direction='column' style={{
        width: '100vw',
        height: '100vh',
    }}>
        <Spin spinning={loading} tip={loadingTip} percent={loadingPercent} fullscreen size='large'></Spin>
        <WorkspacesApp style={{
            flex: 1,
            height: 0
        }} workspaces={workspaces} onActive={record => {
            self.current.activeWorkspace(true, record);
        }} />
    </Flex>
});