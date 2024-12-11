import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Flex, InjectClass, useUpdate } from "../../natived";
import { Button, Card, Input, List, Switch, Table, TableColumnsType, Tabs } from "antd";
import { ResizeButton } from "../../uilibs/ResizeButton";

export interface IConfigAppProps {
    markdownLines?: IConfigMarkdownLine[],
    style?: React.CSSProperties,
}

export interface IConfigAppRef {

}

const tabClass = InjectClass(`
margin-left:10px;
`, {
    before: `

`
});

const hilightBarClass = InjectClass(`
background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,     /* 左侧完全透明 */
    rgba(0, 0, 0, 0) 00%,    /* 左侧透明占 40% */
    #0072C9 00%,              /* 中间区域为蓝色 */
    #0072C9 100%,              /* 中间区域蓝色持续到 60% */
    rgba(0, 0, 0, 0) 100%,     /* 右侧透明占 40% */
    rgba(0, 0, 0, 0) 100%    /* 右侧完全透明 */
);
`);

export interface IConfigMarkdownLine {
    valueKey?: string,
    type: '#' | '##' | '###' | 'card' | 'line' | 'tab' | 'line-switch' | 'line-input' | 'list' | 'table'
    text?: string,
    icon?: string,
    defaultValue?: any,
    listOperations?: {
        add?: boolean,
        remove?: boolean
    },
    tableOptions?: {
        keys: string[]
    },
    children?: IConfigMarkdownLine[]
}

export const ConfigApp = forwardRef<IConfigAppRef, IConfigAppProps>((props, ref) => {
    const [data, updateData, dataRef] = useUpdate<{ [key: string]: any }>({});
    const [leftDelta, setLeftDelta] = useUpdate<number>(0);
    const [currentTab, setCurrentTab, currentTabRef] = useUpdate<string | undefined>(undefined);
    const renderIcon = (icon: string) => {
        return <div></div>
    };

    useEffect(() => {
        if (currentTab == undefined || currentTab == "") {
            setCurrentTab(props.markdownLines?.find(item => item.type == 'tab')?.text ?? "");
        }
    }, [props.markdownLines]);

    const renderItem = (items: IConfigMarkdownLine[], item: IConfigMarkdownLine, path: string, index: number) => {
        if (item.type == '#') {
            let key = `${path}/# ${item.text}`;
            return <Flex key={key}>
                {item.icon == undefined ? undefined : renderIcon(item.icon)}
                <h1>{item.text}</h1>
            </Flex>
        }
        else if (item.type == '##') {
            let key = `${path}/# ${item.text}`;
            return <Flex key={key}>
                {item.icon == undefined ? undefined : renderIcon(item.icon)}
                <h2>{item.text}</h2>
            </Flex>
        }
        else if (item.type == '###') {
            let key = `${path}/# ${item.text}`;
            return <Flex key={key}>
                {item.icon == undefined ? undefined : renderIcon(item.icon)}
                <h3>{item.text}</h3>
            </Flex>
        }
        else if (item.type == 'card') {
            let key = `${path}/card-${index}`;
            return <Card key={key}>
                <Flex direction='column'>
                    {item.children?.map((subItem, subIndex) => {
                        return renderItem(item.children ?? [], subItem, key, subIndex);
                    })}
                </Flex>
            </Card>
        }
        else if (item.type == 'line') {
            let key = `${path}/${item.text}`;
            return <Flex key={key}>
                {item.icon == undefined ? undefined : renderIcon(item.icon)}
                <span>{item.text}</span>
            </Flex>
        }
        else if (item.type == "tab") {
            let key = `${path}/${item.text}`;
            return <Flex style={{
                backgroundColor: item.text == currentTab ? '#E5E5E5' : undefined,
                border: '2px solid transparent',
                borderRadius: '2px',
                cursor: 'pointer',
                color: '#262626',
                fontFamily: `"system-ui", sans-serif`,
                padding: '6px 10px 6px 0px'
            }} key={key} onClick={() => {
                setCurrentTab(item.text ?? "");
            }}>
                <div className={item.text == currentTab ? hilightBarClass : undefined} style={{
                    width: '3px'
                }}></div>
                <Flex className={tabClass}>
                    {item.icon == undefined ? undefined : renderIcon(item.icon)}
                    <span>{item.text}</span>
                </Flex>
            </Flex>
        }
        else if (item.type == 'line-switch') {
            if (item.valueKey == undefined) {
                throw `valueKey is undefined, ${item}`;
            }
            let key = `${path}/switch ${item.valueKey}`;
            return <Flex key={key}>
                <div style={{
                    flex: 1
                }}>
                    {item.icon == undefined ? undefined : renderIcon(item.icon)}
                    <span>{item.text}</span>
                </div>
                <Switch value={data[item.valueKey]} onChange={e => {
                    if (item.valueKey == undefined) {
                        throw `valueKey is undefined, ${item}`;
                    }
                    let newData = { ...data };
                    newData[item.valueKey] = e;
                    updateData(newData);
                    console.log(dataRef.current);
                }}></Switch>
            </Flex>
        }
        else if (item.type == 'line-input') {
            if (item.valueKey == undefined) {
                throw `valueKey is undefined, ${item}`;
            }
            let key = `${path}/input ${item.valueKey}`;
            return <Flex key={key}>
                <Flex verticalCenter style={{
                    flex: 1,
                    padding: '0px 10px 0px 0px'
                }}>
                    {item.icon == undefined ? undefined : renderIcon(item.icon)}
                    <span style={{
                        textWrap: 'nowrap'
                    }}>{item.text}</span>
                </Flex>
                <Input value={data[item.valueKey]} onChange={e => {
                    if (item.valueKey == undefined) {
                        throw `valueKey is undefined, ${item}`;
                    }
                    let newData = { ...data };
                    newData[item.valueKey] = e.target.value;
                    updateData(newData);
                    console.log(dataRef.current);
                }}></Input>
            </Flex>
        }
        else if (item.type == 'list') {
            if (item.valueKey == undefined) {
                throw `valueKey is undefined, ${item}`;
            }
            let key = `${path}/list ${item.valueKey}`;
            let listData = data[item.valueKey];
            if (listData == undefined && item.defaultValue) {
                listData = item.defaultValue;
                let newData = { ...data };
                newData[item.valueKey] = listData;
                updateData(newData);
            }
            const handleAdd = () => {
                if (item.valueKey == undefined) {
                    throw `valueKey is undefined, ${item}`;
                }
                let newData = { ...data };
                if (newData[item.valueKey] == undefined) {
                    newData[item.valueKey] = [];
                }
                newData[item.valueKey].push("");
                updateData(newData);
            };
            const handleRemove = (index: number) => {
                if (item.valueKey == undefined) {
                    throw `valueKey is undefined, ${item}`;
                }
                let newData = { ...data };
                newData[item.valueKey].splice(index, 1);
                updateData(newData);
            };
            return <List key={key} dataSource={listData == undefined || listData.length == 0 ? [""] : listData} renderItem={(listItem: any, index) => {
                if (item.valueKey == undefined) {
                    throw `valueKey is undefined, ${item}`;
                }

                let indexData = data[item.valueKey];
                if (indexData == undefined || indexData.length == 0) {
                    return <Flex verticalCenter style={{
                        padding: '2px 0px'
                    }}>
                        <Button style={{
                            width: '100%'
                        }} type='text' onClick={handleAdd}>{"New"}</Button>
                    </Flex>
                }
                else {
                    return <Flex verticalCenter style={{
                        padding: '2px 0px'
                    }}>
                        <Flex style={{
                            flex: 1,
                            padding: '0px 10px'
                        }}>
                            <Input value={listItem} onChange={e => {
                                if (item.valueKey == undefined) {
                                    throw `valueKey is undefined, ${item}`;
                                }
                                let newData = { ...data }
                                newData[item.valueKey][index] = e.target.value;
                                updateData(newData);
                            }}></Input>
                        </Flex>
                        <Flex spacing={'4px'}>
                            <Button type='text' onClick={handleAdd}>{"Add"}</Button>
                            <Button type='text' onClick={() => handleRemove(index)}>{"Remove"}</Button>
                        </Flex>
                    </Flex>
                }
            }}>

            </List>
        }
        else if (item.type == 'table') {
            if (item.valueKey == undefined) {
                throw `valueKey is undefined, ${item}`;
            }
            let key = `${path}/table ${item.valueKey}`;
            let columns: TableColumnsType<any> = [{
                key: 'No.',
                title: 'No.',
                fixed: 'left',
                width: '4em',
                render: (text, record, index) => {
                    return index + 1;
                }
            }];
            let handleAdd = () => {
                if (item.valueKey == undefined) {
                    throw `valueKey is undefined, ${item}`;
                }
                let newData = { ...data };
                if (newData[item.valueKey] == undefined) {
                    newData[item.valueKey] = [];
                }
                let newItem = {} as any;
                for (let itemKey of item.tableOptions?.keys ?? []) {
                    newItem[itemKey] = "";
                }
                newData[item.valueKey].push(newItem);
                updateData(newData);
            };
            let handleRemove = (index: number) => {
                if (item.valueKey == undefined) {
                    throw `valueKey is undefined, ${item}`;
                }
                let newData = { ...data };
                newData[item.valueKey].splice(index, 1);
                updateData(newData);
            };
            for (let itemKey of item.tableOptions?.keys ?? []) {
                columns.push({
                    key: itemKey,
                    title: itemKey,
                    render: (recordText, record, recordIndex) => {
                        return <Input value={record[itemKey]} onChange={e => {
                            if (item.valueKey == undefined) {
                                throw `valueKey is undefined, ${item}`;
                            }
                            let newData = { ...data }
                            newData[item.valueKey][recordIndex][itemKey] = e.target.value;
                            updateData(newData);
                        }}></Input>;
                    }
                });
            }
            columns.push({
                key: 'Operations',
                title: 'Operations',
                fixed: 'right',
                width: '12em',
                render: (text, record, index) => {
                    return <Flex spacing={'4px'}>
                        <Button type='text' onClick={handleAdd}>{"Add"}</Button>
                        <Button type='text' onClick={() => handleRemove(index)}>{"Remove"}</Button>
                    </Flex>;
                }
            });
            let tempData = data[item.valueKey];
            if (tempData == undefined && item.defaultValue) {
                tempData = item.defaultValue;
                let newData = { ...data };
                newData[item.valueKey] = tempData;
                updateData(newData);
            }
            if (tempData == undefined || Object.keys(tempData).length == 0) {
                return <Button onClick={handleAdd} type='text' style={{
                    width: '100%'
                }}>{"New"}</Button>
            }
            else {
                return <Table style={{
                    // minHeight: '300px'
                }} scroll={{
                    y: '300px'
                }} key={key} dataSource={data[item.valueKey] ?? []} columns={columns} pagination={{
                    pageSize: 1000
                }}>

                </Table>;
            }
        }

    };
    return <Flex direction='row'
        style={{
            backgroundColor: 'rgb(247, 247, 247)',
            ...props.style
        }}>
        <Flex direction='column' style={{
            width: `calc(${200}px + ${leftDelta}px)`,
            padding: '30px 25px 0px 50px'
        }} spacing={'4px'}>
            {props.markdownLines?.map((item, itemIndex) => {
                return renderItem(props.markdownLines ?? [], item, "", itemIndex);
            })}
        </Flex>
        <ResizeButton onDeltaChange={setLeftDelta}></ResizeButton>
        <Flex style={{
            flex: 1,
            overflowY: 'auto'
        }} direction='column'>
            <Flex style={{
                paddingInlineStart: '50px',
                paddingBlockStart: '50px',
                paddingInlineEnd: '50px',
                paddingBlockEnd: '50px',
            }} direction='column'>
                {
                    props.markdownLines?.find(item => item.text == currentTab)?.children?.map((item, itemIndex) => {
                        return renderItem(props.markdownLines ?? [], item, item.text ?? "", itemIndex);
                    })
                }
            </Flex>
        </Flex>
    </Flex>
});