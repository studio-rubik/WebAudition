import React from 'react';
import styled from 'styled-components';
import { DownloadOutlined } from '@ant-design/icons';
import { List } from 'antd';

import * as domain from '../common/Domain';

type Props = {
  files?: domain.File[];
};

const FileList: React.FC<Props> = ({ files }) => {
  return (
    <List
      bordered
      size="small"
      dataSource={files}
      header={
        <ListHeader>
          <strong>Files</strong>
        </ListHeader>
      }
      renderItem={(item: domain.File) => (
        <List.Item
          actions={[
            <a href={item.url} key="download">
              <DownloadOutlined />
            </a>,
          ]}
        >
          {item.key.split('/').pop()}
        </List.Item>
      )}
    />
  );
};

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

export default FileList;
