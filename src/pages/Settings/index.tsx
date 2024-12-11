import { forwardRef, useEffect, useRef } from "react";
import { ConfigApp, IConfigMarkdownLine } from "../../apps/configApp";
import { Flex, useUpdate } from "../../natived";
import { Button } from "antd";
import { services } from "../../services";

export interface ISettingsProps {

}

export interface ISettingsRef {

}

export const Settings = forwardRef<ISettingsRef, ISettingsProps>((props, ref) => {
    const [markdownLines, setMarkdownLines] = useUpdate<IConfigMarkdownLine[]>([]);
    const defaultConfig = useRef<any>(undefined);
    useEffect(() => {
        let func = async () => {
            try{
                let currentConfig = {
                    defaultDirectory: await services.getDefaultDirectory(),
                    subscribers: await services.getPluginSubscribers()
                };
                defaultConfig.current = currentConfig;
                setMarkdownLines([
                    {
                        type: '#',
                        text: 'Settings'
                    },
                    {
                        type: 'tab',
                        text: "Workspace",
                        children: [
                            {
                                type: '##',
                                text: "Master Workspace"
                            },
                            {
                                type: 'card',
                                children: [
                                    {
                                        type: 'line-input',
                                        text: 'Default Workspace:',
                                        valueKey: 'defaultDirectory',
                                        defaultValue: currentConfig.defaultDirectory
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: 'tab',
                        text: 'Plugins',
                        children: [
                            {
                                type: '##',
                                text: 'Subscribers'
                            },
                            {
                                type: 'card',
                                children: [
                                    {
                                        type: 'table',
                                        text: 'Subscribers:',
                                        valueKey: 'subscribers',
                                        tableOptions: {
                                            keys: ["name", "url"]
                                        },
                                        defaultValue: currentConfig.subscribers
                                    }
                                ]
                            }
                        ]
                    }
                ]);
            }
            catch(e:any){
                console.log(e);
            }
            
        };
        func();
    }, []);
    return <Flex direction='column' style={{
        height: '100vh'
    }} spacing={'4px'}>
        <ConfigApp style={{
            flex: 1
        }} markdownLines={markdownLines} />
        <Flex style={{
            padding: '10px 10px'
        }}>
            <div style={{
                flex: 1
            }}></div>
            <Flex style={{
                padding: '0px 10px 0px 0px'
            }}>
                <Button type='text'>
                    {"Apply"}
                </Button>
            </Flex>
        </Flex>
    </Flex>
});