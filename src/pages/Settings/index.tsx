import { forwardRef, useEffect, useRef } from "react";
import { ConfigApp, IConfigAppRef, IConfigMarkdownLine } from "../../apps/ConfigApp";
import { Flex, useUpdate } from "../../natived";
import { Button, Spin } from "antd";
import { services } from "../../services";
import { HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export interface ISettingsProps {

}

export interface ISettingsRef {

}

export const Settings = forwardRef<ISettingsRef, ISettingsProps>((props, ref) => {
    const navigate = useNavigate();
    const [markdownLines, setMarkdownLines] = useUpdate<IConfigMarkdownLine[]>([]);
    const defaultConfig = useRef<any>(undefined);
    const configRef = useRef<IConfigAppRef | null>(null);
    const [loading, updateLoading, loadingRef] = useUpdate(false);
    const self = useRef({
        refresh: async (showLoading: boolean) => {
            if (showLoading) updateLoading(true);
            try {
                let currentConfig = {
                    defaultDirectory: await services.getDefaultDirectory(),
                    subscribers: await services.getPluginSubscribers(),
                    localSubscribers: await services.getLocalSubscribers(),
                    plugins: await services.getPlugins()
                };
                defaultConfig.current = JSON.parse(JSON.stringify(currentConfig));
                setMarkdownLines([
                    "# Settings",
                    {
                        type: 'tab',
                        text: "Workspace",
                        children: [
                            "## Master Workspace",
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
                            "## Subscribers",
                            {
                                type: 'card',
                                children: [
                                    {
                                        type: 'table',
                                        text: 'Subscribers:',
                                        valueKey: 'subscribers',
                                        tableOptions: {
                                            keys: ["name", "url", {
                                                key: "type",
                                                type: 'select',
                                                selectOptions: ["git-release", "git-repository"],
                                                selectWidth: '12em',
                                                columnWidth: '14em'
                                            }],
                                        },
                                        defaultValue: currentConfig.subscribers
                                    }
                                ]
                            },
                            {
                                type: 'card',
                                children: [
                                    {
                                        type: 'line-switch',
                                        text: 'Update Plugins After Apply',
                                        defaultValue: false,
                                        valueKey: 'updatePluginsAfterApply'
                                    }
                                ]
                            },
                            "## Local Subscribers",
                            {
                                type: 'card',
                                children: [
                                    {
                                        type: 'table',
                                        valueKey: 'localSubscribers',
                                        tableOptions: {
                                            keys: ["name", "url"],
                                            add: false
                                        },
                                        defaultValue: currentConfig.localSubscribers
                                    },
                                ]
                            },
                            "## Plugins",
                            {
                                type: 'card',
                                children: [
                                    {
                                        type: 'table',
                                        valueKey: 'plugins',
                                        tableOptions: {
                                            defaultType: 'text',
                                            keys: ["Name", "Entry"],
                                            add: false,
                                            remove: false
                                        },
                                        defaultValue: currentConfig.plugins
                                    }
                                ]
                            }
                        ]
                    }
                ]);
            }
            catch (e: any) {
                console.log(e);
            }
            if (showLoading) updateLoading(false);
        }
    });
    useEffect(() => {
        self.current.refresh(true);
    }, []);
    const handleApply = async () => {
        let currentConfig = configRef.current?.getConfig();
        console.log(`currentConfig: ${JSON.stringify(currentConfig)}`);
        console.log(`defaultConfig: ${JSON.stringify(defaultConfig.current)}`);
        if (currentConfig == undefined) {
            console.log("config is undefined");
            return;
        }
        updateLoading(true);
        try {
            if (JSON.stringify(defaultConfig.current.defaultDirectory) != JSON.stringify(currentConfig.defaultDirectory)) {
                await services.setDefaultDirectory(currentConfig.defaultDirectory);
            }
            if (JSON.stringify(defaultConfig.current.subscribers) != JSON.stringify(currentConfig.subscribers)) {
                await services.setPluginSubscribers(currentConfig.subscribers);
            }
            if (JSON.stringify(defaultConfig.current.localSubscribers) != JSON.stringify(currentConfig.localSubscribers)) {
                for (let oldSubscriber of defaultConfig.current.localSubscribers) {
                    if (!currentConfig.localSubscribers.find((x: any) => x.name == oldSubscriber.name)) {
                        await services.removeLocalSubscriber(oldSubscriber.name);
                    }
                }
            }
            if (currentConfig.updatePluginsAfterApply == true) {
                await services.updatePlugins();
            }
        } catch (e: any) {
            console.log(e);
        }
        self.current.refresh(false);

        updateLoading(false);
    };
    return <Flex direction='column' style={{
        height: '100vh',
        backgroundColor: 'rgb(247, 247, 247)',
    }} spacing={'4px'}>
        <Spin spinning={loading} fullscreen></Spin>
        <Flex direction='column' style={{
            flex: 1,
            height: 0
            // overflowY:'auto'
        }}>
            <ConfigApp style={{ height: '100%' }} ref={configRef} markdownLines={markdownLines} />
        </Flex>
        <Flex style={{
            padding: '30px 50px 30px 0px'
        }}>
            <div style={{
                flex: 1
            }}></div>
            <Flex style={{
                padding: '0px 10px 0px 0px'
            }}>
                <Button onClick={handleApply}>
                    {"Apply"}
                </Button>
            </Flex>
        </Flex>
    </Flex>
});