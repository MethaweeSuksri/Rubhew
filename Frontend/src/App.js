import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './MainContent';
import Home from './Home';
import Order from './Order';
import Rubhew from './Rubhew';
import Ordered from './Ordered';
import UserProfile from './UserProfile';
import UnpaidOrders from './UnpaidOrders';
import CustomerUnpaidOrders from './CustomerUnpaidOrders';
import LoginPage from './LoginPage';
import SignInPage from './SignInPage';

import './css/home.css';
import './css/App.css';

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />


        <Route path="/login" element={<LoginPage />} />

        <Route path="/signin" element={<SignInPage />} />

        <Route
          path="/home"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />

 
        <Route
          path="/order"
          element={
            <Layout>
              <Order />
            </Layout>
          }
        />


        <Route
          path="/rubhew"
          element={
            <Layout>
              <Rubhew />
            </Layout>
          }
        />

   
        <Route
          path="/ordered"
          element={
            <Layout>
              <Ordered />
            </Layout>
          }
        />

   
        <Route
          path="/unpaid-orders"
          element={
            <Layout>
              <UnpaidOrders />
            </Layout>
          }
        />

     
        <Route
          path="/customer-unpaid-orders"
          element={
            <Layout>
              <CustomerUnpaidOrders />
            </Layout>
          }
        />

   
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
