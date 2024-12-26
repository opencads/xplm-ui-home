import { forwardRef, useEffect, useRef } from "react";
import { IWorkspaceRecord, WorkspacesApp } from "../../apps/WorkspacesApp";
import { useUpdate } from "../../natived";
import { services } from "../../services";

export interface IWorkspaceProps {

}

export interface IWorkspaceRef {

}

export const Workspace = forwardRef<IWorkspaceRef, IWorkspaceProps>((props: IWorkspaceProps, ref) => {
    const [workspaces, updateWorkspaces, workspacesRef] = useUpdate<IWorkspaceRecord[]>([]);
    const self = useRef({
        refreshWorkspaces: async () => {
            let workspaces = await services.getRemoteWorkspaces();
            updateWorkspaces(workspaces);
        }
    });
    useEffect(() => {
        self.current.refreshWorkspaces();
    }, []);
    return <WorkspacesApp style={{
        width:'100vw',
        height:'100vh'
    }} workspaces={workspaces} />;
});