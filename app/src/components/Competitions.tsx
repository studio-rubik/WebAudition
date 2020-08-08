import React, { useEffect, useState, useCallback, useRef } from 'react';
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
        store.competitions = {
          byId: { ...store.competitions.byId, ...resp.data.competitions.byId },
          allIds: [
            ...store.competitions.allIds,
            ...resp.data.competitions.allIds,
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
        <List.Item
          actions={[
            <Link key="description" to={`/competitions/${item.id}`}>
              <FontAwesomeIcon icon={faChevronRight} />
            </Link>,
          ]}
        >
          <List.Item.Meta
            title={item.title}
            description={truncate(item.requirements, 30)}
          />
        </List.Item>
      )}
    />
  );
};

const CompetitionDescription: React.FC = () => {
  const { id } = useParams();
  const compet = useStore((store) => store.competitions.byId[id ?? '']);
  const ref = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<WaveSurfer | null>(null);
  const [playerBtnElem, setPlayerBtnElem] = useState<React.ReactElement>(
    <Spin />,
  );

  useEffect(() => {
    if (ref.current == null) return;
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
  }, []);

  const handlePlayerBtnClick = useCallback(() => {
    if (player?.isPlaying()) {
      player?.pause();
    } else {
      player?.play();
    }
  }, [player]);

  return (
    <>
      <Row justify="center">
        <Col>
          <Typography.Title level={2}>{compet.title}</Typography.Title>
        </Col>
      </Row>
      <Row justify="end">
        <Col>Miles Davis</Col>
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
  );
};

export default CompetitionsRoute;
