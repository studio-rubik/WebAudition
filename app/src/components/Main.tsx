import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { useAuth0 } from '../auth0';
import Competitions from './Competitions';
import Applications from './Applications';
import Reactions from './Reactions';

const Main = () => {
  return (
    <>
      <Switch>
        <Route path="/applications">
          <Applications />
        </Route>
        <Route path="/reactions">
          <Reactions />
        </Route>
        <Route path="/">
          <Competitions />
        </Route>
      </Switch>
    </>
  );
};

export default Main;
