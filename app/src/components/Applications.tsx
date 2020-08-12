import React from 'react';
import { useRouteMatch, useParams } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import { useStore } from '../store';

import ApplicationsSubmit from './ApplicationsSubmit';

const ApplicationsRoute: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <>
      <Switch>
        <Route path={`${path}/submit`}>
          <ApplicationsSubmit />
        </Route>
      </Switch>
    </>
  );
};

const Applications: React.FC = () => {
  const { id: competId } = useParams();
  const compet = useStore((store) => store.competitions.byId[competId ?? '']);
  const appls = useStore((store) =>
    store.applications.allIds
      .map((applId) => store.applications.byId[applId])
      .filter((a) => a.competition === compet.id),
  );
  const applFiles = useStore((store) =>
    store.applicationFiles.allIds.map(
      (fileId) => store.applicationFiles.byId[fileId],
    ),
  );
  return (
    <>
      {/* <Row>
        <Col span={24}>
          <Card title="Applications">
            {user?.id === compet?.userId ? (
              <Collapse>
                {appls.map((appl) => (
                  <Collapse.Panel
                    header={
                      profiles.find((prof) => prof.userId === appl.userId)?.name
                    }
                    key={appl.id}
                  >
                    <List
                      bordered
                      size="small"
                      dataSource={applFiles.filter(
                        (file) => file.application === appl.id,
                      )}
                      renderItem={(item: domain.ApplicationFile) => (
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
                  </Collapse.Panel>
                ))}
              </Collapse>
            ) : (
              <div>
                <Row gutter={[0, 12]} justify="center">
                  <Col>{`${appls.length} users applied!`}</Col>
                </Row>
                <Row justify="center">
                  <Col>
                    <Button type="primary">Apply Now</Button>
                  </Col>
                </Row>
              </div>
            )}
          </Card>
        </Col>
      </Row> */}
    </>
  );
};

export default ApplicationsRoute;
