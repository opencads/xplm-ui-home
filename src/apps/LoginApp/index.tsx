import { forwardRef } from "react";
import { Flex, useUpdate } from "../../natived";
import { Button, Input } from "antd";

export interface ILoginAppRef {

}

export interface ILoginAppProps {
    style?: React.CSSProperties,
    onLogin: (username: string, password: string) => void
}

export const LoginApp = forwardRef<ILoginAppRef, ILoginAppProps>((props, ref) => {
    const [username, updateUsername] = useUpdate("");
    const [password, updatePassword] = useUpdate("")
    return <Flex direction='column' spacing={'4px'}>
        <Flex style={{
            padding: '8px 16px',
            ...props.style
        }}>
            <div style={{ width: '12em' }}>{"Username:"}</div>
            <Input style={{ flex: 1 }} value={username} onChange={e => {
                updateUsername(e.target.value)
            }} />
        </Flex>
        <Flex style={{
            padding: '8px 16px'
        }}>
            <div style={{ width: '12em' }}>{"Password:"}</div>
            <Input.Password style={{ flex: 1 }} value={password} onChange={e => {
                updatePassword(e.target.value)
            }} />
        </Flex>
        <Flex style={{
            padding: '8px 16px'
        }}>
            <Button style={{ flex: 1 }} onClick={() => {
                props.onLogin(username, password)
            }}>{"Login"}</Button>
        </Flex>
    </Flex>
})