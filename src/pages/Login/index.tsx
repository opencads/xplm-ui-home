import { forwardRef, useRef } from "react";
import { Flex, useUpdate } from "../../natived";
import { LoginApp } from "../../apps/LoginApp";
import { Spin } from "antd";
import { services } from "../../services";

export interface ILoginRef {

}

export interface ILoginProps {

}

export const Login = forwardRef<ILoginRef, ILoginProps>((props, ref) => {
    const [loading, updateLoading] = useUpdate(false);
    const self = useRef({
        login: async (username: string, password: string) => {
            updateLoading(true);
            try {
                await services.login(username, password);
            }
            catch {

            }
            updateLoading(false);
        }
    });
    return <Flex verticalCenter horizontalCenter>
        <Spin spinning={loading} fullscreen></Spin>
        <LoginApp style={{
            width: '400px',
        }} onLogin={(username, password) => {
            self.current?.login(username, password);
        }} />
    </Flex>
});