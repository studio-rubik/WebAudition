import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';

import { useAuth0 } from '../auth0';
import useRepository from '../hooks/useRepository';

const Main = () => {
  const { isAuthenticated, user } = useAuth0();
  const repo = useRepository();
  useEffect(() => {
    repo.test().then((resp) => {
      console.log(resp);
    });
  }, [repo]);

  return (
    <>
      <Switch>
        <Route path={`/`}>
          <p>Main Contents</p>
          <p>{`isLogged in: ${isAuthenticated}, userID: ${user?.id}`}</p>
        </Route>
      </Switch>
    </>
  );
};

export default Main;
