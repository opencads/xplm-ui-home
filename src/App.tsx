import React, { useEffect, useRef } from 'react';
// import './App.css';
import { Flex, useUpdate } from './natived'
import { Button, Table, TableColumnsType } from 'antd';
import { DocumentInterface } from './interfaces';
import { services } from './services';
import ImportFileButton from './lib/ImportFileButton';
import useMessage from 'antd/es/message/useMessage';

function App() {
  const [messageApi, contextHolder] = useMessage();
  const [data, updateData, dataRef] = useUpdate<DocumentInterface[]>([]);
  const columns: TableColumnsType<DocumentInterface> = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'originFileName',
      dataIndex: 'originFileName',
      key: 'originFileName'
    },
    {
      title: 'createTime',
      dataIndex: 'createTime',
      key: 'createTime'
    }
  ];
  const self = useRef({
    refresh: async () => {
      let directory = await services.getDefaultDirectory();
      let documents = await services.getDocumentsByDirectory(directory);
      updateData(documents);
    },
  });
  useEffect(() => {
    (async () => {
      try {
        await self.current.refresh();
      } catch (e: any) {
        messageApi.error(`Refresh failed, ${e.message ?? "Unknown error"}`);
      }
    })();
  }, []);
  return (<Flex direction='column' style={{

  }}>
    {contextHolder}
    <Flex direction='row'>
      
    </Flex>
    
  </Flex>)
}

export default App;
