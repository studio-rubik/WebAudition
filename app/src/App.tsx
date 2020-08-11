import React from 'react';
import styled from 'styled-components';
import { Link, Switch, Route } from 'react-router-dom';
import Helmet from 'react-helmet';
import { Layout, Menu } from 'antd';

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
      <Layout>
        <Header style={{ background: 'white' }}>
          <Logo>
            <Link to="/">WouldYouPlay?</Link>
          </Logo>
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
          <Container>
            <Switch>
              <Route path="/auth">
                <Auth />
              </Route>
              <Route path="/">
                <Main />
              </Route>
            </Switch>
          </Container>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          © 2020 Studio Rubik, All Rights Reserved
        </Footer>
      </Layout>
    </>
  );
}

const Container = styled.div`
  background: #fff;
  padding: 24px;
  min-height: 400px;
  margin-top: 40px;
`;

const Logo = styled.div`
  width: 120px;
  height: 30px;
  line-height: 30px;
  margin: 16px 24px 16px 0;
  float: left;
`;

export default App;
