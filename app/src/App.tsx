import React from 'react';
import { Link, Switch, Route, Redirect } from 'react-router-dom';
import Helmet from 'react-helmet';
import { Layout, Menu, Breadcrumb } from 'antd';

import { useAuth0 } from './auth0';
import Auth from './components/Auth';
import Main from './components/Main';
import { CSSProperties } from 'styled-components';

const { Header, Content, Footer } = Layout;
const centerStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
};
const rightStyle: CSSProperties = { position: 'absolute', top: 0, right: 0 };

function App() {
  const { isAuthenticated, logout, user } = useAuth0();

  return (
    <>
      <Helmet titleTemplate="%s - WouldYouPlay" defaultTitle="WouldYouPlay" />
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <div>
            <Menu selectable={false} mode="horizontal" style={centerStyle}>
              <Menu.Item>Nav 1</Menu.Item>
              <Menu.Item>Nav 2</Menu.Item>
              <Menu.Item>Nav 3</Menu.Item>
            </Menu>
            <Menu selectable={false} mode="horizontal" style={rightStyle}>
              <Menu.Item>
                {isAuthenticated ? (
                  <div onClick={() => logout()}>Logout</div>
                ) : (
                  <Link to="/auth">Login</Link>
                )}
              </Menu.Item>
            </Menu>
          </div>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Switch>
            <Route path="/auth">
              <Auth />
            </Route>
            <Route path="/">
              <Main />
            </Route>
          </Switch>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          © 2020 Studio Rubik, All Rights Reserved
        </Footer>
      </Layout>
    </>
  );
}

export default App;
