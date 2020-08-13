import React, { useState } from 'react';
import { Button, Form, Input, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

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
  const history = useHistory();
  const [sending, setSending] = useState(false);

  const onFinish = async (values: any) => {
    const data = {
      title: values.title,
      requirements: values.requirements,
    };
    const files =
      values.files != null ? values.files.map((f: any) => f.originFileObj) : [];
    setSending(true);
    try {
      const resp = await repo.competitionPost(data, files);
      message.success('You published an audition!');
      history.push(`/competitions/${resp.competition.id}`);
    } catch {
      message.error('Something went wrong.');
    } finally {
      setSending(false);
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
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
        <Input.TextArea
          rows={10}
          placeholder="Describe what you expect from your auditionees."
        />
      </Form.Item>
      <Form.Item label="Files">
        <Form.Item
          name="files"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          noStyle
        >
          <Upload.Dragger name="files" customRequest={dummyRequest}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-hint">
              Upload anything that helps your audition
            </p>
          </Upload.Dragger>
        </Form.Item>
      </Form.Item>
      <Form.Item>
        <Button
          disabled={sending}
          loading={sending}
          type="primary"
          htmlType="submit"
        >
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CompetitionsSubmit;
