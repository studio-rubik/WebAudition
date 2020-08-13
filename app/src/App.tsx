import React from 'react';
import './App.less';
import styled from 'styled-components';
import { Link, Switch, Route } from 'react-router-dom';
import Helmet from 'react-helmet';
import { Layout, Button } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInbox } from '@fortawesome/free-solid-svg-icons';

import { useAuth0 } from './auth0';
import Auth from './components/Auth';
import Main from './components/Main';
import GlobalActions from './components/GlobalActions';

const { Header, Content, Footer } = Layout;

function App() {
  const { isAuthenticated } = useAuth0();

  return (
    <>
      <Helmet titleTemplate="%s - WouldYouPlay" defaultTitle="WouldYouPlay" />
      <Layout>
        <Header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 10px',
            background: 'white',
          }}
        >
          <Logo>
            <StyledLink to="/">WebAudition</StyledLink>
          </Logo>
          <HeaderMenu>
            <HeaderMenuItem>
              <Button>
                <Link to="/reactions">
                  <FontAwesomeIcon icon={faInbox} size="lg" />
                </Link>
              </Button>
            </HeaderMenuItem>
            <HeaderMenuItem>
              {isAuthenticated ? (
                <GlobalActions />
              ) : (
                <Button type="primary">
                  <Link to="/auth">Log in | Sign up</Link>
                </Button>
              )}
            </HeaderMenuItem>
          </HeaderMenu>
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
  height: 100%;
  text-align: center;
  font-weight: bold;
  font-size: 20px;
`;

const StyledLink = styled(Link)`
  display: inline-block;
  text-decoration: none;
  color: #34a0d1;

  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }
`;

const HeaderMenu = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
`;

const HeaderMenuItem = styled.div`
  padding: 0 8px;
`;

export default App;
