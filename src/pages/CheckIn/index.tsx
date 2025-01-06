import { forwardRef, useEffect } from "react";
import { Flex } from "../../natived";
import { services } from "../../services";
import { dragClass } from "../Home";
import { Button } from "antd";
import { CloseOutlined, MinusOutlined } from "@ant-design/icons";

export interface ICheckInProps {

}

export interface ICheckInRef {

}

export const CheckIn = forwardRef<ICheckInRef, ICheckInProps>((props, ref) => {
    useEffect(() => {
        let func = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has("dataID")) {
                let dataID = urlParams.get("dataID");
                if (dataID) {
                    console.log(await services.getDataByID(dataID));
                }
            }
        };
        func();
    }, []);
    return <Flex direction='column' style={{
        width: '100vw',
        height: '100vh',
    }}>
        <Flex>
            <Flex horizontalCenter className={dragClass} onMouseDown={e => {
                services.mouseDownDrag();
                e.preventDefault();
                e.stopPropagation();
            }} style={{
                flex: 1,
                userSelect: 'none'
            }}>
                {"Check In"}
            </Flex>
            <Button type='text'
                icon={<MinusOutlined />} onClick={() => {
                    services.minimize();
                }}>
            </Button>
            <Flex direction='column'>

            </Flex>
        </Flex>
    </Flex>
});
