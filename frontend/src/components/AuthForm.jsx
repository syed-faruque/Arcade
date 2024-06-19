import React from 'react';
import { Link } from 'react-router-dom';
import '../prettify/Styles.css';

const AuthForm = ({ type, data, error, handleChange, handleSubmit }) => {
    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
            <div className='bg-white p-8 rounded shadow-md w-full max-w-md'>
                <h1 className='text-2xl font-bold text-center mb-6'>{type === 'login' ? 'Login' : 'Sign Up'}</h1>
                <form onSubmit={handleSubmit} className='space-y-6'>
                    <input
                        type='text'
                        name='username'
                        placeholder={type === 'login' ? 'Username' : 'Create username'}
                        onChange={handleChange}
                        value={data.username}
                        className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <input
                        type='password'
                        name='password'
                        placeholder={type === 'login' ? 'Password' : 'Create password'}
                        onChange={handleChange}
                        value={data.password}
                        className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <input
                        type='submit'
                        value={type === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}
                        className='w-full px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition duration-200'
                    />
                    {type === 'login' ? (
                        <Link to='/signup' className='block text-center text-blue-500 hover:underline'>Create new account</Link>
                    ) : (
                        <Link to='/' className='block text-center text-blue-500 hover:underline'>Already have an account</Link>
                    )}
                    {error && <label className='block text-red-500 text-center mt-2'>{error}</label>}
                </form>
            </div>
        </div>
    );
};

export default AuthForm;
