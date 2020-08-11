import React from 'react';
import { Button, Form, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router';

import useRepository from '../hooks/useRepository';

const validateMessages = {
  required: '${label} is required.',
};

const dummyRequest = ({ file, onSuccess }: { file: File; onSuccess: any }) => {
  setTimeout(() => {
    onSuccess('ok');
  }, 0);
};

const ApplicationsSubmit: React.FC<any> = (props) => {
  const repo = useRepository();
  const location = useLocation();
  const competitionId = new URLSearchParams(location.search).get('for');

  const onFinish = async (values: any) => {
    if (competitionId == null) return;
    const file = values.file[0].originFileObj;
    await repo.applicationPost(file, competitionId);
  };

  const normFile = (e: any) => {
    switch (e.file.status) {
      case 'uploading':
        return [e.file];
      case 'done':
        return [e.file];
      default:
        return [];
    }
  };

  return (
    <Form
      layout="vertical"
      name="competition"
      onFinish={onFinish}
      validateMessages={validateMessages}
    >
      <Form.Item label="Audio File">
        <Form.Item
          name="file"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          noStyle
          rules={[{ required: true }]}
        >
          <Upload.Dragger name="files" customRequest={dummyRequest}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload.
            </p>
            <p className="ant-upload-hint">wav, mp3, m4a</p>
          </Upload.Dragger>
        </Form.Item>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ApplicationsSubmit;
