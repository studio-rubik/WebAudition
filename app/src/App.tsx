import React from 'react';
import styled from 'styled-components';
import { Link, Switch, Route } from 'react-router-dom';
import Helmet from 'react-helmet';
import { Layout, Menu, Button } from 'antd';

import { useAuth0 } from './auth0';
import Auth from './components/Auth';
import Main from './components/Main';
import GlobalActions from './components/GlobalActions';
import { CSSProperties } from 'styled-components';

const { Header, Content, Footer } = Layout;
const centerStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
};
const rightStyle: CSSProperties = {
  paddingRight: 12,
  position: 'absolute',
  top: 0,
  right: 0,
};

function App() {
  const { isAuthenticated } = useAuth0();

  return (
    <>
      <Helmet titleTemplate="%s - WouldYouPlay" defaultTitle="WouldYouPlay" />
      <Layout>
        <Header style={{ background: 'white' }}>
          <Logo>
            <Link to="/">WouldYouPlay?</Link>
          </Logo>
          <div>
            <Menu
              selectable={false}
              mode="horizontal"
              style={centerStyle}
            ></Menu>
            <div style={rightStyle}>
              {isAuthenticated ? (
                <GlobalActions />
              ) : (
                <Button type="primary">
                  <Link to="/auth">Log in | Sign up</Link>
                </Button>
              )}
            </div>
          </div>
        </Header>
        <Content>
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
  margin: 0 auto;
  max-width: 1000px;
  padding: 12px 4px;
  min-height: 400px;
`;

const Logo = styled.div`
  width: 120px;
  height: 30px;
  line-height: 30px;
  margin: 16px 24px 16px 0;
  float: left;
`;

export default App;
