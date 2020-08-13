import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Link, Switch, Route, useParams } from 'react-router-dom';
import { List, Card, Button, Row, Col, Typography, Spin, Collapse } from 'antd';
import { useStore } from '../store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useAuth0 } from '../auth0';

import * as domain from '../common/Domain';
import { unique } from '../common/utils';
import useRepository from '../hooks/useRepository';
import CompetitionsSubmit from './CompetitionsSubmit';
import CompetitionComments from './CompetitionComments';
import FileList from './FileList';

const CompetitionsRoute: React.FC = () => {
  return (
    <>
      <Switch>
        <Route exact path="/">
          <Competitions />
        </Route>
        <Route exact path="/competitions">
          <Competitions />
        </Route>
        <Route exact path="/competitions/submit">
          <CompetitionsSubmit />
        </Route>
        <Route path={`/competitions/:id`}>
          <CompetitionDetail />
        </Route>
      </Switch>
    </>
  );
};

const LIMIT = 5;

const Competitions = () => {
  const { isAuthenticated } = useAuth0();
  const compets = useStore((store) =>
    store.competitions.allIds.map((id) => store.competitions.byId[id]),
  );
  const set = useStore((store) => store.set);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const repo = useRepository();
  const directEntry = useStore((store) => store.directEntry);
  const initStore = useStore((store) => store.initialize);

  const fetchCompets = useCallback(async () => {
    if (hasMore) {
      setLoading(true);
      const resp = await repo.competitionsGet(LIMIT, compets.length);
      set((store) => {
        store.profiles = {
          byId: { ...store.profiles.byId, ...resp.data.profiles.byId },
          allIds: unique([
            ...store.profiles.allIds,
            ...resp.data.profiles.allIds,
          ]),
        };
        store.competitions = {
          byId: { ...store.competitions.byId, ...resp.data.competitions.byId },
          allIds: unique([
            ...store.competitions.allIds,
            ...resp.data.competitions.allIds,
          ]),
        };
        store.competitionComments = {
          byId: {
            ...store.competitionComments.byId,
            ...resp.data.competitionComments.byId,
          },
          allIds: unique([
            ...store.competitionComments.allIds,
            ...resp.data.competitionComments.allIds,
          ]),
        };
        store.competitionFiles = {
          byId: {
            ...store.competitionFiles.byId,
            ...resp.data.competitionFiles.byId,
          },
          allIds: unique([
            ...store.competitionFiles.allIds,
            ...resp.data.competitionFiles.allIds,
          ]),
        };
      });
      setHasMore(resp.hasMore);
      setLoading(false);
    }
  }, [compets.length, hasMore, repo, set]);

  useEffect(() => {
    if (directEntry) {
      initStore();
      set((store) => {
        store.directEntry = false;
      });
    }
  }, [directEntry, initStore, set]);

  useEffect(() => {
    if (compets.length === 0) {
      fetchCompets();
    }
  }, [compets.length, fetchCompets]);

  const loadMore = hasMore ? (
    <div
      style={{
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 12,
        height: 32,
        lineHeight: '32px',
      }}
    >
      <Button loading={loading} onClick={fetchCompets}>
        More
      </Button>
    </div>
  ) : null;

  return (
    <Row gutter={[0, 16]}>
      <Col span={24}>
        <Card>
          <List
            bordered
            dataSource={compets}
            loadMore={loadMore}
            renderItem={(item: domain.Competition) => (
              <ListItem>
                <Link to={`/competitions/${item.id}`}>
                  <List.Item
                    actions={[
                      <FontAwesomeIcon key="right" icon={faChevronRight} />,
                    ]}
                  >
                    <List.Item.Meta
                      title={item.title}
                      description={
                        <Typography.Paragraph ellipsis>
                          {item.requirements}
                        </Typography.Paragraph>
                      }
                    />
                  </List.Item>
                </Link>
              </ListItem>
            )}
            header={
              <ListHeader>
                <Typography.Title level={4}>
                  Would you play any below?
                </Typography.Title>
                {isAuthenticated ? (
                  <Button type="primary">
                    <Link to="/competitions/submit">Submit</Link>
                  </Button>
                ) : (
                  <Button type="primary">
                    <Link to="/auth">Sign up to submit</Link>
                  </Button>
                )}
              </ListHeader>
            }
          />
        </Card>
      </Col>
    </Row>
  );
};

const ListItem = styled.div`
  border-bottom: 1px solid #f0f0f0;
  :hover {
    background: #f6f6f6;
  }
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CompetitionDetail: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  const { id: competId } = useParams();
  const compet = useStore((store) => store.competitions.byId[competId ?? '']);
  const comments = useStore((store) =>
    store.competitionComments.allIds
      .map((id) => store.competitionComments.byId[id])
      .filter((comment) => comment.competition === compet?.id),
  );
  const competFiles = useStore((store) =>
    store.competitionFiles.allIds
      .map((fileId) => store.competitionFiles.byId[fileId])
      .filter((file) => file.competition === compet?.id),
  );
  const profiles = useStore((store) =>
    store.profiles.allIds.map((profId) => store.profiles.byId[profId]),
  );
  const set = useStore((store) => store.set);
  const [loading, setLoading] = useState(true);
  const repo = useRepository();

  const fetchCompet = useCallback(async () => {
    if (compet != null || competId == null) return;
    setLoading(true);
    const resp = await repo.competitionGet(competId);
    set((store) => {
      store.directEntry = true;
      store.profiles = {
        byId: { ...store.profiles.byId, ...resp.data.profiles.byId },
        allIds: unique([
          ...store.profiles.allIds,
          ...resp.data.profiles.allIds,
        ]),
      };
      store.competitions = {
        byId: { ...store.competitions.byId, ...resp.data.competitions.byId },
        allIds: unique([
          ...store.competitions.allIds,
          ...resp.data.competitions.allIds,
        ]),
      };
      store.competitionComments = {
        byId: {
          ...store.competitionComments.byId,
          ...resp.data.competitionComments.byId,
        },
        allIds: unique([
          ...store.competitionComments.allIds,
          ...resp.data.competitionComments.allIds,
        ]),
      };
      store.competitionFiles = {
        byId: {
          ...store.competitionFiles.byId,
          ...resp.data.competitionFiles.byId,
        },
        allIds: unique([
          ...store.competitionFiles.allIds,
          ...resp.data.competitionFiles.allIds,
        ]),
      };
    });
    setLoading(false);
  }, [compet, competId, repo, set]);

  useEffect(() => {
    if (compet == null) {
      fetchCompet();
    } else {
      setLoading(false);
    }
  }, [compet, fetchCompet]);

  console.log(competFiles);

  return !loading ? (
    <>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Card
            title={
              <div style={{ whiteSpace: 'normal' }}>
                <Typography.Title level={4} style={{ marginBottom: 0 }}>
                  {compet.title}
                </Typography.Title>
              </div>
            }
            extra={`by ${
              profiles.find((p) => p.userId === compet.userId)?.name
            }`}
          >
            <Row gutter={[0, 24]}>
              <Col span={24}>
                <div style={{ whiteSpace: 'pre-line' }}>
                  {compet.requirements}
                </div>
              </Col>
            </Row>
            <Row gutter={[0, 24]}>
              <Col span={24}>
                <FileList files={competFiles} />
              </Col>
            </Row>
            <Row gutter={[0, 12]} justify="center">
              <Col>
                <Button type="primary">
                  {isAuthenticated ? (
                    <Link to={`/applications/submit?for=${compet.id}`}>
                      Apply
                    </Link>
                  ) : (
                    <Link to={`/auth`}>Sign up to apply</Link>
                  )}
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <CompetitionComments
            competitionId={compet.id}
            comments={comments}
            profiles={profiles}
          />
        </Col>
      </Row>
    </>
  ) : (
    <Spin />
  );
};

export default CompetitionsRoute;
