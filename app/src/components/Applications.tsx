import React from 'react';
import { useRouteMatch } from 'react-router';
import { Switch, Route } from 'react-router-dom';

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

export default ApplicationsRoute;
