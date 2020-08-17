import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Form, Input, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router';
import { useHistory } from 'react-router-dom';

import useRepository from '../hooks/useRepository';

const validateMessages = {
  required: '${label} is required.',
};

const dummyRequest = ({ onSuccess }: { file: File; onSuccess: any }) => {
  setTimeout(() => {
    onSuccess('ok');
  }, 0);
};

const ApplicationsSubmit: React.FC<any> = () => {
  const repo = useRepository();
  const location = useLocation();
  const history = useHistory();
  const competitionId = new URLSearchParams(location.search).get('for');
  const [sending, setSending] = useState(false);

  const onFinish = async (values: any) => {
    if (competitionId == null) return;
    const files =
      values.files != null ? values.files.map((f: any) => f.originFileObj) : [];
    setSending(true);
    await repo.applicationPost(
      { contact: values.contact },
      files,
      competitionId,
    );
    message.success('Your application is sent!');
    history.push(`/competitions/${competitionId}`);
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
      <Form.Item name="contact" label="Contact" rules={[{ required: true }]}>
        <Input placeholder="Email, Twitter ID, etc..." />
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
            <p className="ant-upload-hint">Up to 500MB in total</p>
          </Upload.Dragger>
        </Form.Item>
      </Form.Item>
      <Form.Item>
        <TextAlignCenter>
          <Button
            type="primary"
            htmlType="submit"
            disabled={sending}
            loading={sending}
          >
            Submit
          </Button>
        </TextAlignCenter>
      </Form.Item>
    </Form>
  );
};

const TextAlignCenter = styled.div`
  text-align: center;
`;

export default ApplicationsSubmit;
