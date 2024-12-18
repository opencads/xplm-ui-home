import { Avatar, Button, Card, Dropdown } from "antd";
import { forwardRef } from "react";
import { IUserInfomation } from "../../interfaces";
import { Flex } from "../../natived";
import { services } from "../../services";
import { UserOutlined } from "@ant-design/icons";

export interface IUserAvatarAppRef {

}

export interface IUserAvatarAppProps {
    info: IUserInfomation,
    style?: React.CSSProperties
}

export const UserAvatarApp = forwardRef<IUserAvatarAppRef, IUserAvatarAppProps>((props, ref) => {
    if (props.info.isLogin) {
        return <Dropdown menu={{
            items: []
        }} dropdownRender={() => {
            return <Card style={{
                backgroundColor: '#eee'
            }}>
                <Flex direction='column' style={{ width: '280px' }}>
                    <Flex direction='row' verticalCenter spacing={'8px'} style={{
                        padding: '12px 16px'
                    }}>
                        <Avatar icon={<UserOutlined />} src={props.info.avatar_url} shape={'circle'} size={'large'}></Avatar>
                        <div style={{ flex: 1 }}>{props.info.name}</div>
                    </Flex>
                    <Flex direction='column' style={{
                        padding: '8px'
                    }}>
                        <Flex style={{
                            padding: '4px 8px'
                        }}>
                            <div>{"Email"}</div>
                            <div style={{ flex: 1 }}></div>
                            <div >{props.info.email}</div>
                        </Flex>
                    </Flex>
                    <Flex direction='column' style={{
                        padding: '8px'
                    }}>
                        <Button type='text'>{"Logout"}</Button>
                    </Flex>
                </Flex>
            </Card>
        }}>
            <Avatar icon={<UserOutlined />} size={'small'} style={{
                cursor: 'pointer',
                ...props.style
            }} shape={'circle'} src={props.info.avatar_url}>
            </Avatar>
        </Dropdown>
    }
    else {
        return <Avatar icon={<UserOutlined />} size={'small'} style={{
            cursor: 'pointer',
            ...props.style
        }} shape={'circle'} onClick={() => {
            let currentUrl = window.location.pathname;
            services.openUrl(currentUrl + '/login');
        }}>
        </Avatar>
    }

})