import { forwardRef, useEffect } from "react";
import { Flex } from "../../natived";

export interface ISaveToWorkspaceProps {

}

export interface ISaveToWorkspaceRef {

}

export const SaveToWorkspace = forwardRef<ISaveToWorkspaceRef, ISaveToWorkspaceProps>((props, ref) => {
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        // 打印所有参数
        for (const [key, value] of urlParams.entries()) {
            console.log(`${key}: ${value}`);
        }
    }, []);
    return <Flex>

    </Flex>
});
