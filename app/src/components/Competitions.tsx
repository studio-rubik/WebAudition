import React, { useEffect, useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { Link, Switch, Route, useParams } from 'react-router-dom';
import { List, Button, Row, Col, Typography, Divider, Spin } from 'antd';
import { useStore } from '../store';
import WaveSurfer from 'wavesurfer.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

import * as domain from '../common/Domain';
import { truncate } from '../common/utils';
import useRepository from '../hooks/useRepository';

const CompetitionsRoute: React.FC = () => {
  return (
    <>
      <Switch>
        <Route exact path="/">
          <Competitions />
        </Route>
        <Route path={`/competitions/:id`}>
          <CompetitionDescription />
        </Route>
      </Switch>
    </>
  );
};

const LIMIT = 10;

const Competitions = () => {
  const compets = useStore((store) =>
    store.competitions.allIds.map((id) => store.competitions.byId[id]),
  );
  const set = useStore((store) => store.set);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const repo = useRepository();

  const fetchCompets = useCallback(async () => {
    if (hasMore) {
      setLoading(true);
      const resp = await repo.competitionsGet(LIMIT, compets.length);
      set((store) => {
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
      setHasMore(resp.hasMore);
      setLoading(false);
    }
  }, [compets.length, hasMore, repo, set]);

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
    />
  );
};

const ListItem = styled.div`
  border-bottom: 1px solid #f0f0f0;
  :hover {
    background: #f6f6f6;
  }
`;

const CompetitionDescription: React.FC = () => {
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
  const ref = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<WaveSurfer | null>(null);
  const [playerBtnElem, setPlayerBtnElem] = useState<React.ReactElement>(
    <Spin />,
  );

  const set = useStore((store) => store.set);
  const [loading, setLoading] = useState(true);
  const repo = useRepository();

  const fetchCompet = useCallback(async () => {
    if (compet != null || id == null) return;
    setLoading(true);
    const resp = await repo.competitionGet(id);
    set((store) => {
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

  useEffect(() => {
    if (loading || ref.current == null) return;
    const wavesurfer = WaveSurfer.create({
      container: ref.current,
      barWidth: 2,
      barHeight: 1,
    });
    wavesurfer.on('ready', () => {
      setPlayerBtnElem(<FontAwesomeIcon icon={faPlay} />);
    });
    wavesurfer.on('play', () => {
      setPlayerBtnElem(<FontAwesomeIcon icon={faPause} />);
    });
    wavesurfer.on('pause', () => {
      setPlayerBtnElem(<FontAwesomeIcon icon={faPlay} />);
    });
    wavesurfer.load(
      'http://localhost:9000/audio/Samba.wav?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20200808%2F%2Fs3%2Faws4_request&X-Amz-Date=20200808T125917Z&X-Amz-Expires=432000&X-Amz-SignedHeaders=host&X-Amz-Signature=dfa35c04c404bac9c06127aa80c940c25572d43adab6e71f0ea042bc28c08bb4',
    );
    setPlayer(wavesurfer);
    return () => {
      wavesurfer.destroy();
    };
  }, [loading]);

  const handlePlayerBtnClick = useCallback(() => {
    if (player?.isPlaying()) {
      player?.pause();
    } else {
      player?.play();
    }
  }, [player]);

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
        <div style={{ width: '100%' }} ref={ref} />
      </Row>
      <Row justify="center">
        <Button onClick={handlePlayerBtnClick}>{playerBtnElem}</Button>
      </Row>
      <Divider />
      <Typography.Title level={3}>Requirements:</Typography.Title>
      <Row justify="center">
        <Col>
          <Typography.Paragraph>{compet.requirements}</Typography.Paragraph>
        </Col>
      </Row>
    </>
  ) : (
    <Spin />
  );
};

export default CompetitionsRoute;
