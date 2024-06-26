/**
 * author: Syed Faruque
 * created: May 20 2024
**/

import React, { useEffect, useState } from 'react';
import AuthForm from '../components/AuthForm';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Login = ({ socket }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [data, setData] = useState({ username: '', password: '' });
  const username = useAuth(socket);

  useEffect(() => {
    if (!socket) return;

    if (username) {
      navigate("/home");
    }

    socket.on('login_results', (data) => {
      if (data.success) {
        const token = data.token;
        localStorage.setItem('token', token);
        navigate('/home');
      } else {
        setError('Invalid username or password');
      }
    });

    return () => {
      socket.off('login_results');
    };
  }, [socket, username]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    socket.emit('login', data);
  };

  return (
    <AuthForm
      type='login'
      data={data}
      error={error}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
    />
  );
};

export default Login;