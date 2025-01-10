import { forwardRef, useEffect, useRef } from "react";
import { Flex, useUpdate } from "../../natived";
import { LoginApp } from "../../apps/LoginApp";
import { Button, Spin } from "antd";
import { services } from "../../services";
import { CloseOutlined } from "@ant-design/icons";
import { dragClass } from "../Home";
import { globalRefreshWorkspaces } from "../Workspaces";

export interface ILoginRef {

}

export interface ILoginProps {

}

export const Login = forwardRef<ILoginRef, ILoginProps>((props, ref) => {
    const [loading, updateLoading] = useUpdate(false);
    const [username, updateUsername] = useUpdate('');
    const [password, updatePassword] = useUpdate('');
    const [remember, updateRemember] = useUpdate(false);
    const self = useRef({
        login: async (username: string, password: string) => {
            updateLoading(true);
            try {
                let info = await services.login(username, password);
                localStorage.setItem('login', JSON.stringify(info));
                await services.close();
            }
            catch {

            }
            updateLoading(false);
        },
        refreshInfo: async (showLoading: boolean) => {
            if (showLoading)
                updateLoading(true);
            try {
                let info = await services.getLoginInfo();
                updateUsername(info.username ?? "");
                if (info.remember) updatePassword(info.password ?? "");
                updateRemember(info.remember ?? true);
            }
            catch {

            }
            if (showLoading)
                updateLoading(false);
        }
    });
    useEffect(() => {
        self.current.refreshInfo(true);
    }, []);
    return <Flex direction='column' style={{
        width: '100vw',
        height: '100vh'
    }}>
        <Spin spinning={loading} fullscreen></Spin>
        <Flex>
            <Flex className={dragClass} onMouseDown={e => {
                services.mouseDownDrag();
                e.preventDefault();
                e.stopPropagation();
            }} style={{
                flex: 1,
                userSelect: 'none'
            }}>

            </Flex>
            <Button type='text'
                icon={<CloseOutlined></CloseOutlined>} onClick={() => {
                    services.close();
                }}>
                {"Close"}
            </Button>
            <Flex>

            </Flex>
        </Flex>
        <Flex style={{
            flex: 1
        }} direction='column' verticalCenter horizontalCenter>
            <Spin spinning={loading} fullscreen></Spin>
            <LoginApp username={username} password={password} remember={remember}
                updateUsername={updateUsername} updatePassword={updatePassword} updateRemember={updateRemember} style={{
                    width: '400px',
                }} onLogin={(username, password, remember) => {
                    services.setLoginInfo(username, password, remember);
                    self.current?.login(username, password);
                    globalRefreshWorkspaces();
                }} />
        </Flex>
    </Flex>

});