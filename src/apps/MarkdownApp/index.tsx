import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Flex, InjectClass, useUpdate } from "../../natived";
import { Button, Card, Input, List, Select, Switch, Table, TableColumnsType, Tabs } from "antd";
import { ResizeButton } from "../../uilibs/ResizeButton";

export interface IMarkdownAppProps {
    markdownLines?: IMarkdownLine[],
    style?: React.CSSProperties,
    // contentStyle?: React.CSSProperties,
    currentTab?: string,
    onTabChange?: (key: string) => void
}

export interface IMarkdownAppRef {
    getData: () => { [key: string]: any },
    clearData: () => void,
    renderItem: (items: IMarkdownLine[], item: IMarkdownLine, path: string, index: number) => JSX.Element | undefined
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

export interface MarkdownLine {
    valueKey?: string,
    type: '#' | '##' | '###' |
    'card' | 'line' | 'tab' |
    'line-switch' | 'line-input' | 'line-select' |
    'line-text' | 'list' | 'table'
    text?: string,
    icon?: string,
    defaultValue?: any,
    listOperations?: {
        add?: boolean,
        remove?: boolean
    },
    tableOptions?: {
        add?: boolean,
        remove?: boolean,
        defaultType?: 'input' | 'text',
        keys: (string | {
            key: string,
            title?: string,
            type: 'text' | 'input' | 'select'
            selectOptions?: string[],
            newValue?: any,
            columnWidth?: number | string,
            selectWidth?: number | string,
        })[]
    },
    selectOptions?: {
        options: string[]
    }
    children?: IMarkdownLine[]
}

export type IMarkdownLine = MarkdownLine | string;

export const MarkdownApp = forwardRef<IMarkdownAppRef, IMarkdownAppProps>((props, ref) => {
    const [data, updateData, dataRef] = useUpdate<{ [key: string]: any }>({});
    const renderIcon = (icon: string) => {
        return <div></div>
    };

    const renderItem = (items: IMarkdownLine[], item: IMarkdownLine, path: string, index: number): JSX.Element | undefined => {
        if (typeof (item) == 'string') {
            if (item.startsWith('# ')) {
                return renderItem(items, {
                    type: '#', text: item.substring(2)
                }, path, index);
            }
            else if (item.startsWith('## ')) {
                return renderItem(items, {
                    type: '##', text: item.substring(3)
                }, path, index);
            }
            else if (item.startsWith('### ')) {
                return renderItem(items, {
                    type: '###', text: item.substring(4)
                }, path, index);
            }
            else {
                return <div key={`${path}/${index}`}>{item}</div>
            }
        }
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
                backgroundColor: item.text == props.currentTab ? '#E5E5E5' : undefined,
                border: '2px solid transparent',
                borderRadius: '2px',
                cursor: 'pointer',
                color: '#262626',
                fontFamily: `"system-ui", sans-serif`,
                padding: '6px 10px 6px 0px'
            }} key={key} onClick={() => {
                props.onTabChange && props.onTabChange(item.text ?? "");
            }}>
                <div className={item.text == props.currentTab ? hilightBarClass : undefined} style={{
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
                throw `valueKey is undefined, ${JSON.stringify(item)}`;
            }
            let key = `${path}/switch ${item.valueKey}`;
            let tempValue = data[item.valueKey];
            if (tempValue == undefined && item.defaultValue) {
                tempValue = item.defaultValue;
                let newData = { ...data };
                newData[item.valueKey] = tempValue;
                updateData(newData);
            }
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
                throw `valueKey is undefined, ${JSON.stringify(item)}`;
            }
            let key = `${path}/input ${item.valueKey}`;
            let tempValue = data[item.valueKey];
            if (tempValue == undefined && item.defaultValue) {
                tempValue = item.defaultValue;
                let newData = { ...data };
                newData[item.valueKey] = tempValue;
                updateData(newData);
            }
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
        else if (item.type == 'line-select') {
            if (item.valueKey == undefined) {
                throw `valueKey is undefined, ${JSON.stringify(item)}`;
            }
            let key = `${path}/select ${item.valueKey}`;
            let tempValue = data[item.valueKey];
            if (tempValue == undefined && item.defaultValue) {
                tempValue = item.defaultValue;
                let newData = { ...data };
                newData[item.valueKey] = tempValue;
                updateData(newData);
            }
            return <Flex key={key}>
                <Flex verticalCenter style={{
                    flex: 1,
                    padding: '0px 10px 0px 0px'
                }}>
                    {item.icon == undefined ? undefined : renderIcon(item.icon)}
                    <span>{item.text}</span>
                </Flex>
                <Select value={data[item.valueKey]} onChange={e => {
                    if (item.valueKey == undefined) {
                        throw `valueKey is undefined, ${item}`;
                    }
                    let newData = { ...data };
                    newData[item.valueKey] = e;
                    updateData(newData);
                }} options={item.selectOptions?.options?.map(e => {
                    return {
                        value: e,
                        label: e
                    }
                })}></Select>
            </Flex>
        }
        else if (item.type == 'line-text') {
            let key = `${path}/text ${item.text}`;
            return <Flex key={key}>
                <div style={{
                    flex: 1,
                    padding: '0px 10px',
                    textWrap: 'nowrap',
                }}>
                    {item.text}
                </div>
                <div>
                    {item.defaultValue}
                </div>
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
            let enableAdd = item.listOperations?.add == undefined || item.listOperations?.add == true;
            let enableRemove = item.listOperations?.remove == undefined || item.listOperations?.remove == true;
            return <List key={key} dataSource={listData == undefined || listData.length == 0 ? (
                enableAdd ? [""] : []
            ) : listData} renderItem={(listItem: any, index) => {
                if (item.valueKey == undefined) {
                    throw `valueKey is undefined, ${item}`;
                }

                let indexData = data[item.valueKey];
                if ((indexData == undefined || indexData.length == 0) && enableAdd) {
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
                            {enableAdd ? <Button type='text' onClick={handleAdd}>{"Add"}</Button> : undefined}
                            {enableRemove ? <Button type='text' onClick={() => handleRemove(index)}>{"Remove"}</Button> : undefined}
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
                    if (typeof itemKey == "string") {
                        newItem[itemKey] = "";
                    } else {
                        if (itemKey.newValue) {
                            newItem[itemKey.key] = itemKey.newValue;
                        }
                        else if (itemKey.type == 'select') {
                            if (itemKey.selectOptions && itemKey.selectOptions.length > 0) {
                                newItem[itemKey.key] = itemKey.selectOptions[0];
                            }
                            else {
                                throw `selectOptions is undefined, ${itemKey}, ${item}`;
                            }
                        }
                        else {
                            newItem[itemKey.key] = "";
                        }
                    }
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
            let enableAdd = item.tableOptions?.add == undefined || item.tableOptions?.add == true;
            let enableRemove = item.tableOptions?.remove == undefined || item.tableOptions?.remove == true;
            for (let itemKey of item.tableOptions?.keys ?? []) {
                if (typeof itemKey == "string") {
                    let itemKeyString = itemKey;
                    columns.push({
                        key: itemKey,
                        title: itemKey,
                        minWidth: itemKey.length * 10,
                        render: (recordText, record, recordIndex) => {
                            if (item.tableOptions?.defaultType == undefined || item.tableOptions?.defaultType == 'input') {
                                return <Input value={record[itemKeyString]} onChange={e => {
                                    if (item.valueKey == undefined) {
                                        throw `valueKey is undefined, ${item}`;
                                    }
                                    let newData = { ...data }
                                    newData[item.valueKey][recordIndex][itemKeyString] = e.target.value;
                                    updateData(newData);
                                }}></Input>;
                            }
                            else if (item.tableOptions?.defaultType == 'text') {
                                return <div>{record[itemKeyString]}</div>
                            }
                        }
                    });
                }
                else {
                    let itemKeyObject = itemKey;
                    columns.push({
                        key: itemKey.key,
                        title: itemKey.title ?? itemKey.key,
                        width: itemKeyObject.columnWidth,
                        minWidth: (itemKey.title ?? itemKey.key).length * 10,
                        render: (recordText, record, recordIndex) => {
                            if (itemKeyObject.type == 'select') {
                                return <Select style={{
                                    width: itemKeyObject.selectWidth
                                }} value={record[itemKeyObject.key]} onChange={e => {
                                    if (item.valueKey == undefined) {
                                        throw `valueKey is undefined, ${item}`;
                                    }
                                    let newData = { ...data }
                                    newData[item.valueKey][recordIndex][itemKeyObject.key] = e;
                                    updateData(newData);
                                }} options={itemKeyObject.selectOptions?.map(item => {
                                    return {
                                        value: item,
                                        label: item
                                    }
                                })}>
                                </Select>
                            }
                            else if (itemKeyObject.type == 'text') {
                                return <div>{record[itemKeyObject.key]}</div>
                            }
                            else {
                                return <Input value={record[itemKeyObject.key]} onChange={e => {
                                    if (item.valueKey == undefined) {
                                        throw `valueKey is undefined, ${item}`;
                                    }
                                    let newData = { ...data }
                                    newData[item.valueKey][recordIndex][itemKeyObject.key] = e.target.value;
                                    updateData(newData);
                                }}></Input>;
                            }
                        }
                    });
                }

            }
            if (item.tableOptions?.add != false && item.tableOptions?.remove != false) {
                columns.push({
                    key: 'Operations',
                    title: 'Operations',
                    fixed: 'right',
                    width: '12em',
                    render: (text, record, index) => {
                        return <Flex spacing={'4px'}>
                            {enableAdd ? <Button type='text' onClick={handleAdd}>{"Add"}</Button> : undefined}
                            {enableRemove ? <Button type='text' onClick={() => handleRemove(index)}>{"Remove"}</Button> : undefined}
                        </Flex>;
                    }
                });
            }
            let tempData = data[item.valueKey];
            if (tempData == undefined && item.defaultValue) {
                tempData = item.defaultValue;
                let newData = { ...data };
                newData[item.valueKey] = tempData;
                updateData(newData);
            }
            if ((tempData == undefined || Object.keys(tempData).length == 0) && enableAdd) {
                return <Button onClick={handleAdd} type='text' style={{
                    width: '100%'
                }}>{"New"}</Button>
            }
            else {
                return <Table style={{
                    // minHeight: '300px'
                }} scroll={{
                    y: '300px',
                    x: 'max-content'
                }} key={key} dataSource={data[item.valueKey] ?? []} columns={columns} pagination={{
                    pageSize: 1000
                }}>

                </Table>;
            }
        }
        else {

        }
    };

    const self = useRef<IMarkdownAppRef>({
        getData: () => {
            return dataRef.current;
        },
        renderItem: renderItem,
        clearData: () => {
            updateData({});
        }
    });

    useImperativeHandle(ref, () => self.current);

    const getMarkdownLineText = (item: IMarkdownLine) => {
        if (typeof item == 'string') {
            return item;
        }
        else {
            return item.text ?? "";
        }
    };

    useEffect(() => {
        updateData({});
    }, [props.markdownLines]);
    return <Flex style={{
        ...props.style
    }} direction='column'>
        {props.markdownLines?.map((item, itemIndex) => {
            return renderItem(props.markdownLines ?? [], item, getMarkdownLineText(item), itemIndex);
        })}
    </Flex>
});