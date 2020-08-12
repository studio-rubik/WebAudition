import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Dropdown, Menu } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useAuth0 } from '../auth0';

const GlobalActions: React.FC = () => {
  const { logout } = useAuth0();
  const menu = (
    <Menu style={{ width: 100, textAlign: 'center' }}>
      <Menu.Item key="reactions">
        <Link to="/reactions">Reactions</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={() => logout()}>
        Log out
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button shape="circle">
        <FontAwesomeIcon icon={faBars} size="lg" />
      </Button>
    </Dropdown>
  );
};

export default GlobalActions;
