import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { useAuth0 } from '../auth0';
import Competitions from './Competitions';

const Main = () => {
  const { isAuthenticated, user } = useAuth0();

  return (
    <>
      <Switch>
        <Route path="/">
          <Competitions />
        </Route>
      </Switch>
    </>
  );
};

export default Main;
