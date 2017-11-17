import React from 'react';
import { Link } from 'react-router-dom';

class Home extends React.Component {
  render() {
    return (
      <div className="options-container">
        <div className="donor-routes">
          <Link className="donor-text" to="/donors/login">Donor</Link>
        </div>
        <div className="organization-routes">
          <Link className="organization-text" to="/organizations/login">Organization</Link>
        </div>
      </div>
    );
  }
}

export default Home;
