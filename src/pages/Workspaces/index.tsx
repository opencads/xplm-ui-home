import { forwardRef } from "react";

export interface IWorkspaceProps {

}

export interface IWorkspaceRef {

}

export const Workspace = forwardRef<IWorkspaceRef, IWorkspaceProps>((props: IWorkspaceProps, ref) => {
    return (
        <div>
            Workspace
        </div>
    );
});