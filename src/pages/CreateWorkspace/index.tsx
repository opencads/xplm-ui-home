import { forwardRef, useEffect, useRef } from "react";
import { Flex, useUpdate } from "../../natived";
import { Spin } from "antd";
import { CreateWorkspaceApp } from "../../apps/CreateWorkspaceApp";
import { services } from "../../services";

export interface ICreateWorkspaceRef {

}

export interface ICreateWorkspaceProps {

}

export interface IContainerRecord {
    key: string,
    name: string,
    raw: any
}

export interface IFolderRecord {
    key: string,
    name: string,
    raw: any
}

export const CreateWorkspace = forwardRef<ICreateWorkspaceRef, ICreateWorkspaceProps>((props, ref) => {
    const [workspaceName, updateWorkspacesName, workspaceNameRef] = useUpdate('');
    const [selectedContainer, updateSelectedContainer, selectedContainerRef] = useUpdate<string>('');
    const [selectedWorkspacePath, updateSelectedWorkspacePath, selectedWorkspacePathRef] = useUpdate('');
    const [allContainers, updateAllContainers, allContainersRef] = useUpdate<{ label: string, value: string }[]>([]);
    const [allWorkspacePaths, updateAllWorkspacePaths, allWorkspacePathsRef] = useUpdate<{ label: string, value: string }[]>([]);
    const [loading, updateLoading, loadingRef] = useUpdate(false);
    const [loadingPercent, updateLoadingPercent, loadingPercentRef] = useUpdate<number | undefined>(undefined);
    const [loadingTip, updateLoadingTip, loadingTipRef] = useUpdate('');
    const cacheContains = useRef<IContainerRecord[]>([]);
    const cacheFolders = useRef<IFolderRecord[]>([]);
    const self = useRef({
        refresh: async (showLoading: boolean) => {
            if (showLoading) {
                updateLoading(true);
            }
            try {
                cacheContains.current = await services.getContainers();
                updateAllContainers(cacheContains.current.map(item => {
                    return {
                        label: item.name,
                        value: item.key
                    }
                }));
            }
            catch (e) {
                console.log(e);
            }
            if (showLoading) {
                updateLoading(false);
            }
        },
        refreshFolders: async (showLoading: boolean, container: IContainerRecord) => {
            if (showLoading) {
                updateLoading(true);
            }
            try {
                cacheFolders.current = await services.getContainerFolders(container);
                updateAllWorkspacePaths(cacheFolders.current.map(item => {
                    return {
                        label: item.name,
                        value: item.key
                    }
                }));
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
        if (selectedContainerRef.current.length > 0) {
            self.current.refreshFolders(false, cacheContains.current.find(item => item.key === selectedContainerRef.current)!);
        }
    }, [selectedContainer]);
    return <Flex direction='column' style={{
        width: '100vw',
        height: '100vh',
    }}>
        <Spin size={'large'} tip={<div style={{
            marginTop: '32px'
        }}>{loadingTip}</div>} percent={loadingPercent} spinning={loading} fullscreen></Spin>
        <CreateWorkspaceApp workspaceName={workspaceName} selectedContainer={selectedContainer} selectedWorkspacePath={selectedWorkspacePath}
            allContainers={allContainers} allWorkspacePaths={allWorkspacePaths}
            style={{
                flex: 1
            }} />
    </Flex>
});