import React, { useEffect, useState, useCallback } from 'react';
import { List, Button } from 'antd';

import * as domain from '../common/Domain';
import useRepository from '../hooks/useRepository';

const LIMIT = 10;

const Competitions = () => {
  const [loading, setLoading] = useState(false);
  const [compets, setCompets] = useState<domain.Competition[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const repo = useRepository();

  const fetchCompets = useCallback(async () => {
    if (hasMore) {
      setLoading(true);
      const resp = await repo.competitionsGet(LIMIT, compets.length);
      setCompets((prev) => {
        return prev.concat(resp.data.competitions);
      });
      setHasMore(resp.hasMore);
      setLoading(false);
    }
  }, [compets.length, hasMore, repo]);

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
        <List.Item>{item.id}</List.Item>
      )}
    />
  );
};

export default Competitions;
