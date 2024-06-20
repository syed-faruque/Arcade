/**
 * author: Syed Faruque
 * created: May 20 2024
**/

import React, { useEffect, useState } from 'react';
import AuthForm from '../components/AuthForm';
import { useNavigate } from 'react-router-dom';

const Signup = ({ socket }) => {
  const navigate = useNavigate();
  const [data, setData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;

    socket.on('signup_results', (worked) => {
      if (worked) {
        navigate('/success');
      } else {
        setError('The username you entered already exists in the database.');
      }
    });

    return () => {
      socket.off('signup_results');
    };
  }, [socket, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    socket.emit('signup', data);
  };

  return (
    <AuthForm
      type='signup'
      data={data}
      error={error}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
    />
  );
};

export default Signup;
