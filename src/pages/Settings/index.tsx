import { forwardRef, useEffect, useRef } from "react";
import { ConfigApp, IConfigAppRef } from "../../apps/ConfigApp";
import { Flex, useUpdate } from "../../natived";
import { Button, Spin } from "antd";
import { services } from "../../services";
import { CloseOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { IMarkdownLine } from "../../apps/MarkdownApp";
import { dragClass } from "../Home";

export interface ISettingsProps {

}

export interface ISettingsRef {

}

export const Settings = forwardRef<ISettingsRef, ISettingsProps>((props, ref) => {
    const navigate = useNavigate();
    const [markdownLines, updateMarkdownLines] = useUpdate<IMarkdownLine[]>([]);
    const [loading, updateLoading, loadingRef] = useUpdate(false);
    const [loadingPercent, updateLoadingPercent, loadingPercentRef] = useUpdate<number | undefined>(undefined);
    const [loadingTip, updateLoadingTip, loadingTipRef] = useUpdate('');
    const defaultConfig = useRef<any>(undefined);
    const configRef = useRef<IConfigAppRef | null>(null);
    const foreachKey = async (value: any, validKeys: string[], onKeyValue: (obj: any, key: string, value: any) => Promise<any>) => {
        if (Array.isArray(value)) {
            for (let item of value) {
               await foreachKey(item, validKeys, onKeyValue);
            }
        }
        else if (typeof value === 'object') {
            for (let key in value) {
                if (validKeys.includes(key)) {
                    await onKeyValue(value, key, value[key]);
                }
            }
            for (let key in value) {
                await foreachKey(value[key], validKeys, onKeyValue);
            }
        }
    };
    const self = useRef({
        refresh: async (showLoading: boolean) => {
            if (showLoading) updateLoading(true);
            try {
                let settings = await services.getSettings();
                let defaultValues = {} as any;
                console.log('original settings: ', settings);
                // 获取getter数量
                let getterCount = 0;
                await foreachKey(settings, ["getter"], async (obj, key, value) => {
                    if (typeof value == 'string' && value.startsWith("$plugin:")) getterCount++;
                });
                // 遍历所有的key，如果是getter，则调用并且赋值给defaultValue
                let getterIndex = 0;
                await foreachKey(settings, ["getter"], async (obj, key, value) => {
                    if (key == "getter") {
                        if (typeof value == 'string' && value.startsWith("$plugin:")) {
                            let pluginName = value.substring(8);
                            let valueKey = obj['valueKey'];
                            console.log(`valueKey: ${valueKey}`);
                            updateLoadingTip(`正在获取 ${valueKey} 配置`);
                            updateLoadingPercent(getterIndex / getterCount * 100);
                            obj["defaultValue"] = await services.runPlugin(pluginName, {});
                            defaultValues[valueKey] = obj["defaultValue"];
                            console.log(`defaultValues:`,defaultValues);
                            getterIndex++;
                        }
                    }
                    return value;
                });
                updateMarkdownLines(settings);
                defaultConfig.current = JSON.parse(JSON.stringify(defaultValues));
                console.log('computed default config: ', defaultConfig.current);
            }
            catch (e: any) {
                console.log(e);
            }
            if (showLoading) updateLoading(false);
            updateLoadingPercent(undefined);
            updateLoadingTip('');
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
            let setterCount = 0;
            await foreachKey(markdownLines, ["setter"], async (obj, key, value) => {
                if (key == "setter") {
                    if (typeof value == 'string' && value.startsWith("$plugin:")) setterCount++;
                }
            });
            let setterIndex = 0;
            await foreachKey(markdownLines, ["setter"], async (obj, key, value) => {
                if (key == "setter") {
                    if (typeof value == 'string' && value.startsWith("$plugin:")) {
                        let pluginName = value.substring(8);
                        if (currentConfig) {
                            updateLoadingTip(`正在设置 ${obj['valueKey']} 配置`);
                            await services.runPlugin(pluginName, {
                                currentValue: currentConfig[obj['valueKey']],
                                defaultValue: defaultConfig.current[obj['valueKey']]
                            });
                            updateLoadingPercent(setterIndex / setterCount * 100);
                        }
                    }
                }
                return value;
            });
        } catch (e: any) {
            console.log(e);
        }
        self.current.refresh(false);
        updateLoading(false);
        updateLoadingPercent(undefined);
        updateLoadingTip('');
    };
    return <Flex direction='column' style={{
        height: '100vh',
        backgroundColor: 'rgb(247, 247, 247)',
    }} spacing={'4px'}>
        <Spin size={'large'} tip={<div style={{
            marginTop: '32px'
        }}>{loadingTip}</div>} percent={loadingPercent} spinning={loading} fullscreen></Spin>
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