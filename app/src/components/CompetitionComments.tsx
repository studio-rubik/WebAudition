import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  Comment,
  List,
  Typography,
  Row,
  Col,
  Input,
  Form,
  message,
} from 'antd';

import { useAuth0 } from '../auth0';
import { fromUTC } from '../common/utils';
import * as domain from '../common/Domain';
import useRepository from '../hooks/useRepository';
import { useStore } from '../store';

const validateMessages = {
  required: '${label} is required.',
};

type Props = {
  competitionId: string;
  comments: domain.CompetitionComment[];
  profiles: domain.Profile[];
};

const CompetitionComments: React.FC<Props> = ({
  competitionId,
  comments,
  profiles,
}) => {
  const { isAuthenticated } = useAuth0();
  const repo = useRepository();
  const set = useStore((store) => store.set);
  const [sending, setSending] = useState(false);

  const onFinish = async (values: any) => {
    if (competitionId == null) return;
    setSending(true);
    try {
      const comment = await repo.competitionCommentPost(
        { content: values.comment },
        competitionId,
      );
      set((store) => {
        store.competitionComments.byId[comment.id] = comment;
        store.competitionComments.allIds.push(comment.id);
      });
      message.success('Your comment is sent!');
    } catch {
      message.error('Something went wrong.');
    } finally {
      setSending(false);
    }
  };

  const sortedComments = comments.sort(
    (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
  );

  return (
    <>
      <Card
        title={
          <ListHeader>
            <Typography.Title level={4}>Comments</Typography.Title>
          </ListHeader>
        }
      >
        <Row gutter={[0, 24]}>
          <Col span={24}>
            <List
              bordered
              dataSource={sortedComments}
              renderItem={(item: domain.CompetitionComment) => (
                <List.Item>
                  <Comment
                    author={
                      profiles.find((prof) => prof.userId === item.userId)?.name
                    }
                    avatar={
                      profiles.find((prof) => prof.userId === item.userId)
                        ?.avatar
                    }
                    content={<p>{item.content}</p>}
                    datetime={fromUTC.toRelative(item.updatedAt)}
                  />
                </List.Item>
              )}
            />
          </Col>
        </Row>
        <Row gutter={[0, 24]}>
          <Col span={24}>
            {isAuthenticated ? (
              <Form
                layout="vertical"
                name="competition"
                onFinish={onFinish}
                validateMessages={validateMessages}
              >
                <Form.Item
                  name="comment"
                  label="Leave a comment"
                  rules={[{ required: true }]}
                >
                  <Input.TextArea rows={5} />
                </Form.Item>
                <Form.Item>
                  <TextAlignCenter>
                    <Button
                      type="primary"
                      htmlType="submit"
                      disabled={sending}
                      loading={sending}
                    >
                      Send
                    </Button>
                  </TextAlignCenter>
                </Form.Item>
              </Form>
            ) : (
              <TextAlignCenter>
                <Button type="primary">
                  <Link to="/auth">Sign up to comment</Link>
                </Button>
              </TextAlignCenter>
            )}
          </Col>
        </Row>
      </Card>
    </>
  );
};

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TextAlignCenter = styled.div`
  text-align: center;
`;

export default CompetitionComments;
