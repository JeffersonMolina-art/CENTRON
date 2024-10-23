import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styled-components/Profile.css';

const EmployeeComponent = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegisterAttendance = async () => {
    try {
      // Obtener el ID del empleado y el token desde el localStorage
      const empleado_id = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');

      if (!empleado_id) {
        setMessage('Empleado no identificado.');
        return;
      }

      const nivelAlcohol = "Bajo";

      const response = await axios.post('http://192.168.1.61:3000/api/asistencias/registrar', {
        empleado_id,
        estado: 'Presente',
        nivelAlcohol,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 201) {
        setMessage('Asistencia registrada exitosamente.');
        setIsRegistered(true);
      } else {
        setMessage(`Error: ${response.data.error || 'No se pudo registrar la asistencia.'}`);
      }
    } catch (error) {
      console.error('Error al registrar la asistencia:', error);
      setMessage('Error al registrar la asistencia.');
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId'); 
    navigate('/');
  };

  return (
    <div className="employee-dashboard">
      {/* Barra de navegación lateral */}
      <nav className="sidebar">
        <div className="user-info">
          <p>Bienvenido, Empleado</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
      </nav>

      {/* Contenido principal */}
      <div className="main-content">
        <section className="content">
          {!isRegistered ? (
            <button
              className="register-button"
              onClick={handleRegisterAttendance}
            >
              Registrar Asistencia
            </button>
          ) : (
            <p>Asistencia registrada con éxito.</p>
          )}
          {message && <p>{message}</p>} {/* Mostrar mensajes de error o éxito */}
        </section>
      </div>
    </div>
  );
};

export default EmployeeComponent;