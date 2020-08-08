import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';

import { useAuth0 } from '../auth0';
import useRepository from '../hooks/useRepository';
import Competitions from './Competitions';

const Main = () => {
  const { isAuthenticated, user } = useAuth0();

  return (
    <>
      <Switch>
        <Route path={`/`}>
          <Competitions />
        </Route>
      </Switch>
    </>
  );
};

export default Main;
