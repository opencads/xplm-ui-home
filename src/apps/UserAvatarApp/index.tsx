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
                backgroundColor: '#e8e8e8'
            }}>
                <Flex direction='column' style={{ width: '280px' }}>
                    <Flex direction='row' verticalCenter spacing={'12px'} style={{
                        padding: '12px 16px',
                        backgroundColor:'#ddd'
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
                    <Button style={{
                        // padding: '8px'
                    }}>{"Logout"}</Button>
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