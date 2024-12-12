import { forwardRef, useEffect, useRef } from "react";
import { ConfigApp, IConfigAppRef, IConfigMarkdownLine } from "../../apps/configApp";
import { Flex, useUpdate } from "../../natived";
import { Button, Spin } from "antd";
import { services } from "../../services";

export interface ISettingsProps {

}

export interface ISettingsRef {

}

export const Settings = forwardRef<ISettingsRef, ISettingsProps>((props, ref) => {
    const [markdownLines, setMarkdownLines] = useUpdate<IConfigMarkdownLine[]>([]);
    const defaultConfig = useRef<any>(undefined);
    const configRef = useRef<IConfigAppRef | null>(null);
    const [loading, updateLoading, loadingRef] = useUpdate(false);

    useEffect(() => {
        let func = async () => {
            updateLoading(true);
            try {
                let currentConfig = {
                    defaultDirectory: await services.getDefaultDirectory(),
                    subscribers: await services.getPluginSubscribers(),
                    localSubscribers: await services.getLocalSubscribers()
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
                                        text: 'Update Plugins After Apply:',
                                        defaultValue: false,
                                        valueKey: 'updatePluginsAfterApply'
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
            updateLoading(false);
        };
        func();
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
        updateLoading(false);
    };
    return <Flex direction='column' style={{
        height: '100vh',
        backgroundColor: 'rgb(247, 247, 247)',
    }} spacing={'4px'}>
        <Spin spinning={loading} fullscreen></Spin>
        <ConfigApp ref={configRef} style={{
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
                <Button onClick={handleApply}>
                    {"Apply"}
                </Button>
            </Flex>
        </Flex>
    </Flex>
});