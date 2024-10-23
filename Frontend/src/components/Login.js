import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styled-components/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      // Realiza la solicitud de inicio de sesión al backend
      const response = await axios.post('http://192.168.1.101:3000/api/auth/login', { username, password });
  
      const userData = response.data;
      console.log('Datos recibidos del backend:', userData);
  
      // Verifica que los datos del usuario sean válidos
      if (!userData || !userData.userId) {
        setMessage('Error: Usuario no identificado');
        return;
      }
  
      // Verificar si el rol del usuario es 'admin'
      if (userData.role !== 'admin') {
        setMessage('Acceso denegado: Solo los administradores pueden iniciar sesión.');
        return;
      }
  
      // Mensaje de inicio de sesión exitoso
      setMessage('Inicio de sesión exitoso');
  
      // Almacenar el token y los datos del usuario en el localStorage
      localStorage.setItem('authToken', userData.token);
      localStorage.setItem('userId', userData.userId);
      localStorage.setItem('username', userData.username);
      localStorage.setItem('role', userData.role);
      console.log('Token almacenado:', userData.token);
  
      // Navegar al perfil del usuario
      navigate('/Profile');
  
    } catch (error) {
      console.error('Error en la solicitud:', error);
      
      // Manejo de errores
      if (error.response && error.response.data) {
        setMessage(error.response.data.error || 'Error en el inicio de sesión');
      } else {
        setMessage('Error en el inicio de sesión');
      }
    }
  };  


  return (
    <div className="login-body">
      <div className="login-container">
        <h2 className="login-h2">Iniciar sesión</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label className="login-label">Nombre de usuario:</label>
            <input
              className="login-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="login-label">Contraseña:</label>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="login-button" type="submit">Iniciar sesión</button>
        </form>
        {message && <p className="login-p">{message}</p>}
      </div>
    </div>
  );
};

export default Login;