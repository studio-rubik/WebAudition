import React from 'react';
import { Button, Form, Input, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

import useRepository from '../hooks/useRepository';

const validateMessages = {
  required: '${label} is required.',
};

const dummyRequest = ({ file, onSuccess }: { file: File; onSuccess: any }) => {
  setTimeout(() => {
    onSuccess('ok');
  }, 0);
};

const CompetitionsSubmit: React.FC = () => {
  const repo = useRepository();

  const onFinish = async (values: any) => {
    console.log(values);
    const data = {
      title: values.title,
      requirements: values.requirements,
    };
    const file = values.minusOne[0].originFileObj;
    await repo.competitionPost(data, file);
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
      <Form.Item name="title" label="Title" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        name="requirements"
        label="Requirements"
        rules={[{ required: true }]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item label="Minus one track">
        <Form.Item
          name="minusOne"
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

export default CompetitionsSubmit;
