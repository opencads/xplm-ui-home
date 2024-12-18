import { forwardRef, useRef } from "react";
import { Flex, useUpdate } from "../../natived";
import { LoginApp } from "../../apps/LoginApp";
import { Button, Spin } from "antd";
import { services } from "../../services";
import { CloseOutlined } from "@ant-design/icons";
import { dragClass } from "../Home";

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
                let info = await services.login(username, password);
                localStorage.setItem('login', JSON.stringify(info));
                await services.close();
            }
            catch {

            }
            updateLoading(false);
        }
    });
    return <Flex direction='column' style={{
        width: '100vw',
        height: '100vh'
    }}>
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
            <LoginApp style={{
                width: '400px',
            }} onLogin={(username, password) => {
                self.current?.login(username, password);
            }} />
        </Flex>
    </Flex>

});