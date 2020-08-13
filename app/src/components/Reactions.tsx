import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Descriptions } from 'antd';

import { useAuth0 } from '../auth0';

import { fromUTC } from '../common/utils';
import { ReactionsGetResp } from '../interface/repository';
import useRepository from '../hooks/useRepository';
import FileList from './FileList';

const Reactions: React.FC = () => {
  const { user } = useAuth0();
  const repo = useRepository();
  const [resp, setResp] = useState<ReactionsGetResp | null>(null);
  const compets = resp?.competitions.allIds.map(
    (id) => resp.competitions.byId[id],
  );
  const appls = resp?.applications.allIds.map(
    (id) => resp.applications.byId[id],
  );
  const applFiles = resp?.applicationFiles.allIds.map(
    (id) => resp.applicationFiles.byId[id],
  );
  const profs = resp?.profiles.allIds.map((id) => resp.profiles.byId[id]);
  useEffect(() => {
    async function fn() {
      const response = await repo.reactionsGet(20, 0);
      setResp(response.data);
    }
    fn();
  }, [repo]);

  return (
    <>
      {appls?.map((appl) => (
        <Row gutter={[0, 24]}>
          <Col span={24}>
            <Card
              key={appl.id}
              title={
                <div style={{ whiteSpace: 'normal' }}>
                  {`${profs?.find((p) => p.userId === appl.userId)?.name}
                  applied for your audition!`}
                </div>
              }
              extra={fromUTC.toRelative(appl.createdAt)}
            >
              <>
                <Row gutter={[0, 24]}>
                  <Col span={24}>
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Audition">
                        <Link to={`/competitions/${appl.competition}`}>
                          {resp?.competitions.byId[appl.competition].title}
                        </Link>
                      </Descriptions.Item>
                      <Descriptions.Item label="Date">
                        {fromUTC.toDateTime(appl.createdAt)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Contact">
                        {appl.contact}
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <FileList files={applFiles} />
                  </Col>
                </Row>
              </>
            </Card>
          </Col>
        </Row>
      ))}
    </>
  );
};

export default Reactions;
