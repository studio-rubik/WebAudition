import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Link, Switch, Route, useParams } from 'react-router-dom';
import { List, Button, Row, Col, Typography, Divider, Spin } from 'antd';
import { useStore } from '../store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

import * as domain from '../common/Domain';
import { truncate, unique } from '../common/utils';
import useRepository from '../hooks/useRepository';
import CompetitionsSubmit from './CompetitionsSubmit';
import AudioPlayer from './AudioPlayer';

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
  const compets = useStore((store) =>
    store.competitions.allIds.map((id) => store.competitions.byId[id]),
  );
  const set = useStore((store) => store.set);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const repo = useRepository();
  const directEntry = useStore((store) => store.directEntry);
  const initStore = useStore((store) => store.initialize);

  const fetchCompets = useCallback(async () => {
    if (compets.length === 0 || hasMore) {
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
        store.applications = {
          byId: { ...store.applications.byId, ...resp.data.applications.byId },
          allIds: unique([
            ...store.applications.allIds,
            ...resp.data.applications.allIds,
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
    <List
      bordered
      dataSource={compets}
      loadMore={loadMore}
      renderItem={(item: domain.Competition) => (
        <ListItem>
          <Link to={`/competitions/${item.id}`}>
            <List.Item
              actions={[<FontAwesomeIcon key="right" icon={faChevronRight} />]}
            >
              <List.Item.Meta
                title={item.title}
                description={truncate(item.requirements, 30)}
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
          <Button type="primary">
            <Link to="/competitions/submit">Submit</Link>
          </Button>
        </ListHeader>
      }
    />
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
  const { id } = useParams();
  const compet = useStore((store) => store.competitions.byId[id ?? '']);
  const profile = useStore(
    (store) => store.profiles.byId[compet?.profile ?? ''],
  );
  const appls = useStore((store) =>
    store.applications.allIds
      .map((id) => store.applications.byId[id])
      .filter((a) => a.competition === compet.id),
  );
  const set = useStore((store) => store.set);
  const [loading, setLoading] = useState(true);
  const repo = useRepository();

  const fetchCompet = useCallback(async () => {
    if (compet != null || id == null) return;
    setLoading(true);
    const resp = await repo.competitionGet(id);
    set((store) => {
      store.directEntry = true;
      store.profiles = {
        byId: { ...store.profiles.byId, ...resp.data.profiles.byId },
        allIds: [...store.profiles.allIds, ...resp.data.profiles.allIds],
      };
      store.competitions = {
        byId: { ...store.competitions.byId, ...resp.data.competitions.byId },
        allIds: [
          ...store.competitions.allIds,
          ...resp.data.competitions.allIds,
        ],
      };
      store.applications = {
        byId: { ...store.applications.byId, ...resp.data.applications.byId },
        allIds: [
          ...store.applications.allIds,
          ...resp.data.applications.allIds,
        ],
      };
    });
    setLoading(false);
  }, [compet, id, repo, set]);

  useEffect(() => {
    if (compet == null) {
      fetchCompet();
    } else {
      setLoading(false);
    }
  }, [compet, fetchCompet]);

  return !loading ? (
    <>
      <Row justify="center">
        <Col>
          <Typography.Title level={2}>{compet.title}</Typography.Title>
        </Col>
      </Row>
      <Row justify="end">
        <Col>{profile.name}</Col>
      </Row>
      <Row justify="end">
        <Col>{compet.updatedAt}</Col>
      </Row>
      <Divider />
      <Row justify="center">
        <AudioPlayer audioUrl={compet.minusOneUrl} />
      </Row>
      <Divider />
      <Typography.Title level={3}>Requirements:</Typography.Title>
      <Row justify="center">
        <Col span={23}>
          <Typography.Paragraph>{compet.requirements}</Typography.Paragraph>
        </Col>
      </Row>
      <Divider />
      <Row>
        <Col span={24}>
          <List
            bordered
            pagination={{
              onChange: (page) => {
                console.log(page);
              },
              pageSize: 5,
            }}
            dataSource={appls}
            renderItem={(item: domain.Application) => (
              <List.Item
                actions={[<span key="user">{`by ${profile.name}`}</span>]}
              >
                <AudioPlayer audioUrl={item.fileUrl} />
              </List.Item>
            )}
            header={
              <ListHeader>
                <Typography.Title level={4}>Played tracks</Typography.Title>
                <Button type="primary">
                  <Link to="/competitions/submit">Submit</Link>
                </Button>
              </ListHeader>
            }
          />
        </Col>
      </Row>
    </>
  ) : (
    <Spin />
  );
};

export default CompetitionsRoute;
