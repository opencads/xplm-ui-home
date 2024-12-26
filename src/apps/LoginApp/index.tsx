import { forwardRef } from "react";
import { Flex, useUpdate } from "../../natived";
import { Button, Input, Switch } from "antd";

export interface ILoginAppRef {

}

export interface ILoginAppProps {
    style?: React.CSSProperties,
    onLogin: (username: string, password: string, remember: boolean) => void,
    username: string,
    password: string,
    remember: boolean,
    updateUsername: (username: string) => void,
    updatePassword: (password: string) => void,
    updateRemember: (remember: boolean) => void,
}

export const LoginApp = forwardRef<ILoginAppRef, ILoginAppProps>((props, ref) => {
    return <Flex direction='column' spacing={'4px'} style={props.style}>
        <Flex verticalCenter style={{
            padding: '8px 16px',
        }}>
            <div style={{ width: '8em' }}>{"Username:"}</div>
            <Input style={{ flex: 1 }} value={props.username} onChange={e => {
                props.updateUsername(e.target.value)
            }} />
        </Flex>
        <Flex verticalCenter style={{
            padding: '8px 16px'
        }}>
            <div style={{ width: '8em' }}>{"Password:"}</div>
            <Input.Password style={{ flex: 1 }} value={props.password} onChange={e => {
                props.updatePassword(e.target.value)
            }} />
        </Flex>
        <Flex verticalCenter style={{
            padding: '8px 16px'
        }}>
            <div style={{ width: '8em' }}>{"Remmber:"}</div>
            <div style={{ flex: 1 }}></div>
            <Switch value={props.remember} onChange={props.updateRemember}></Switch>
        </Flex>
        <Flex verticalCenter style={{
            padding: '8px 16px'
        }}>
            <Button style={{ flex: 1 }} onClick={() => {
                props.onLogin(props.username, props.password, props.remember)
            }}>{"Login"}</Button>
        </Flex>
    </Flex>
})