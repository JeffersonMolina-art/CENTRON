import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import './styled-components/Profile.css';
import logo from '../assets/images/logo.png';

const AdminComponent = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [username, setUsername] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [area_id, setArea] = useState('Informatica');
  const [codigoNfc, setCodigoNfc] = useState('');
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [assistances, setAssistances] = useState([]);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [messageCorreo, setMessageCorreo] = useState('');
  const [bitacora, setBitacora] = useState([]);


  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    if (selectedOption === 'Bitacora') {
      fetchBitacora();
    }
    if (selectedOption === 'Usuarios') {
      fetchUsers();
    } if (selectedOption === 'Asistencias') {
      fetchAssistances();
    }
  }, [selectedOption]);

  // Función para obtener la bitácora
  const fetchBitacora = async () => {
    try {
      const response = await fetch('http://192.168.1.101:3000/api/asistencias/bitacora');
      if (!response.ok) {
        throw new Error(`Error al obtener la bitácora: ${response.statusText}`);
      }

      const data = await response.json();
      setBitacora(data);
    } catch (error) {
      console.error('Error al obtener la bitácora:', error);
    }
  };

  const deleteMovimiento = async (id) => {
    try {
      const response = await fetch(`http://192.168.1.101:3000/api/asistencias/bitacora/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar el movimiento: ${response.statusText}`);
      }

      setBitacora(prev => prev.filter(movimiento => movimiento.id !== id));
      alert('Movimiento eliminado exitosamente.');
    } catch (error) {
      console.error('Error al eliminar el movimiento:', error);
    }
  };


  const fetchUsers = async () => {
    try {
      const response = await fetch('http://192.168.1.101:3000/api/auth/users');
      const result = await response.json();
      if (response.ok) {
        setUsers(result);
        setFilteredUsers(result);
      } else {
        setMessage('Error al obtener usuarios');
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setMessage('Error en el servidor');
    }
  };

  const fetchAssistances = async () => {
    try {
      const response = await fetch('http://192.168.1.101:3000/api/asistencias/ultimas');
      const result = await response.json();
      if (response.ok) {
        setAssistances(result);
      } else {
        setMessage('Error al obtener asistencias');
      }
    } catch (error) {
      console.error('Error al obtener asistencias:', error);
      setMessage('Error en el servidor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/');
  };

  const handleFilterByArea = (selectedArea) => {
    if (selectedArea === 'Todos') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => user.area_id === selectedArea);
      setFilteredUsers(filtered);
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    if (isEditing) {
      handleUpdateUser(editUserId);
    } else {
      try {
        const response = await fetch('http://192.168.1.101:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, correo, password, role, area_id, codigoNfc }),
        });

        const result = await response.json();
        if (response.ok) {
          setMessage('Usuario creado exitosamente');
          fetchUsers();
          setShowAddUserForm(false);
          clearForm();
        } else {
          setMessage(result.error || 'Error al crear el usuario');
        }
      } catch (error) {
        console.error('Error al crear usuario:', error);
        setMessage('Error en el servidor');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este usuario?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://192.168.1.101:3000/api/auth/users/${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Usuario eliminado correctamente');
        fetchUsers();
      } else {
        setMessage(result.error || 'Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setMessage('Error en el servidor');
    }
  };

  const handleEditUser = (user) => {
    setIsEditing(true);
    setEditUserId(user.id);
    setUsername(user.username);
    setCorreo(user.correo);
    setRole(user.role);
    setArea(user.area_id);
    setCodigoNfc(user.codigoNfc);
    setShowAddUserForm(true);
  };

  const handleUpdateUser = async (userId) => {
    try {
      const updateData = {
        username,
        correo,
        role,
        area_id,
        codigoNfc,
      };

      if (password !== '') {
        updateData.password = password;
      }

      const response = await fetch(`http://192.168.1.101:3000/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Usuario actualizado correctamente');
        setUsername('');
        setCorreo('');
        setPassword('');
        setRole('employee');
        setArea('Informatica');
        setCodigoNfc('');
        setShowAddUserForm(false);
        setIsEditing(false);
        fetchUsers();
      } else {
        setMessage(result.error || 'Error al actualizar el usuario');
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setMessage('Error en el servidor');
    }
  };

  const handleVerHistorial = async (empleadoId) => {
    try {
      const response = await fetch(`http://192.168.1.101:3000/api/asistencias/historial/${empleadoId}`);
      const result = await response.json();
      if (response.ok) {
        setHistorial(result);
        setShowHistorialModal(true);
      } else {
        setMessage('No se encontraron registros para este empleado.');
      }
    } catch (error) {
      console.error('Error al obtener el historial:', error);
      setMessage('Error en el servidor');
    }
  };


  const clearForm = () => {
    setUsername('');
    setCorreo('');
    setPassword('');
    setRole('employee');
    setArea('Informatica');
    setCodigoNfc('');
    setMessage('');
    setIsEditing(false);
    setEditUserId(null);
  };

  // Función para generar el PDF
  const generarPDF = (empleadoId, username, conteo) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Reporte de Asistencia para ${username}`, 10, 10);

    doc.setFontSize(12);
    doc.text(`ID del empleado: ${empleadoId}`, 10, 20);
    doc.text(`Número de veces reportado con nivel de alcohol Medio o Alto: ${conteo}`, 10, 30);

    const fileName = `reporte_asistencia_${username}_${new Date().toISOString()}.pdf`;
    doc.save(fileName);
  };

  const handleEnviarCorreo = async (empleadoId) => {
    try {
      const response = await fetch(`http://192.168.1.101:3000/api/asistencias/enviar-correo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ empleado_id: empleadoId }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessageCorreo('Correo enviado exitosamente');
      } else {
        setMessage(result.error || 'Error al enviar el correo');
      }
    } catch (error) {
      console.error('Error al enviar correo:', error);
      setMessage('Error en el servidor');
    }

    setTimeout(() => {
      setMessageCorreo('');
    }, 3000)
  };

  const handleReporte = async (empleadoId, username) => {
    try {
      console.log('Generando reporte para el empleado ID:', empleadoId);
      const response = await fetch(`http://192.168.1.101:3000/api/asistencias/reporte/${empleadoId}`);

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message);
        console.log('Reporte generado:', result.message);

        const conteo = result.conteo;

        generarPDF(empleadoId, username, conteo);

        // await handleEnviarCorreo(empleadoId, username, correo);
      } else {
        setMessage('Error al generar el reporte');
      }
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      setMessage('Error en el servidor');
    }
  };



  return (
    <div className="admin-dashboard">
      <nav className="sidebar">
        <div className="user-info">
          <p>Bienvenido!</p>
        </div>
        <ul>
          <li onClick={() => setSelectedOption('Inicio')}>Inicio</li>
          <li onClick={() => setSelectedOption('Usuarios')}>Empleados</li>
          <li onClick={() => setSelectedOption('Asistencias')}>Asistencias</li>
          <li onClick={() => setSelectedOption('Soporte y Ayuda')}>Soporte y Ayuda</li>
          <li onClick={() => setSelectedOption('Bitacora')}>Bitacora</li>
        </ul>
        <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
      </nav>
      <div className="main-content">
        <section className="content">
          {selectedOption === 'Inicio' ? (
            <div className="home-container">
              <h2>Bienvenido al Sistema de Administración</h2>
              <img src={logo} alt="Logo de la Compañía" className="home-logo" />
            </div>
          ) : selectedOption === 'Usuarios' ? (
            <div>
              <h2 className="title-header">Empleados</h2>
              <div className="filter-buttons">
                <button onClick={() => handleFilterByArea('Todos')}>Todos</button>
                <button onClick={() => handleFilterByArea('Informatica')}>Informática</button>
                <button onClick={() => handleFilterByArea('Contabilidad')}>Contabilidad</button>
                <button onClick={() => handleFilterByArea('Administración')}>Administración</button>
              </div>
              <div className="user-list-container">
                {filteredUsers.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Empleado</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Área</th>
                        <th>Código NFC</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.username}</td>
                          <td>{user.correo}</td>
                          <td>{user.role}</td>
                          <td>{user.area_id}</td>
                          <td>{user.codigoNfc || 'No asignado'}</td>
                          <td>
                            <button className="edit-button" onClick={() => handleEditUser(user)}>Editar</button>
                            <button className="delete-button" onClick={() => handleDeleteUser(user.id)}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No hay usuarios en esta área.</p>
                )}
              </div>
              <button className="add-user-button" onClick={() => {
                setIsEditing(false);
                setShowAddUserForm(true);
                clearForm();
              }}>
                Agregar Empleado
              </button>
              {showAddUserForm && (
                <div className="modal">
                  <div className="modal-content">
                    <span className="close-button" onClick={() => {
                      setShowAddUserForm(false);
                      clearForm();
                    }}>&times;</span>
                    <h3>{isEditing ? 'Editar Usuario' : 'Agregar Usuario'}</h3>
                    <form onSubmit={handleCreateUser}>
                      <div>
                        <label>Nombre de usuario:</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label>Contraseña:</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required={!isEditing}
                        />
                      </div>
                      <div>
                        <label>Rol:</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} required>
                          <option value="admin">Administrador</option>
                          <option value="employee">Empleado</option>
                        </select>
                      </div>
                      <div>
                        <label>Correo:</label>
                        <input
                          type="text"
                          value={correo}
                          onChange={(e) => setCorreo(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label>Área:</label>
                        <select value={area_id} onChange={(e) => setArea(e.target.value)} required>
                          <option value="Informatica">Informática</option>
                          <option value="Contabilidad">Contabilidad</option>
                          <option value="Administración">Administración</option>
                        </select>
                      </div>
                      <div>
                        <label>Código NFC:</label>
                        <input
                          type="text"
                          value={codigoNfc}
                          onChange={(e) => setCodigoNfc(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit">
                        {isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
                      </button>
                    </form>
                    {message && <p>{message}</p>}
                  </div>
                </div>
              )}
            </div>
          ) : selectedOption === 'Asistencias' ? (
            <div>
              <h2 className="title-header">Asitencias</h2>
              <div className="user-list-container">
                {/* Alerta para el mensaje de correo */}
                {messageCorreo && (
                  <div className="alert">
                    {messageCorreo}
                  </div>
                )}
                {assistances.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Empleado</th>
                        <th>Área</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Nivel de Alcohol</th>
                        <th>Reporte</th>
                        <th>Enviar Correo</th>
                        <th>Historial</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assistances.map((assistance) => (
                        <tr key={assistance.id}>
                          <td>{assistance.User ? assistance.User.id : 'N/A'}</td>
                          <td>{assistance.User ? assistance.User.username : 'N/A'}</td>
                          <td>{assistance.User ? assistance.User.area_id : 'N/A'}</td>
                          <td>{new Date(assistance.fecha).toLocaleString()}</td>
                          <td>{assistance.estado}</td>
                          <td>{assistance.nivelAlcohol || 'No disponible'}</td>
                          <td>
                            <button className="report-button" onClick={() => handleReporte(assistance.User.id, assistance.User.username)}>
                              Generar Reporte
                            </button>
                          </td>
                          <td>
                            <button
                              className="report-button"
                              onClick={() => handleEnviarCorreo(assistance.User.id, assistance.User.username, assistance.User.correo)}
                            >
                              Enviar Correo
                            </button>
                          </td>
                          <td>
                            <button className="historial-button" onClick={() => handleVerHistorial(assistance.User.id)}>Ver Historial</button>
                          </td>
                          {showHistorialModal && (
                            <div className="modal">
                              <div className="modal-content">
                                <span className="close-button" onClick={() => setShowHistorialModal(false)}>&times;</span>
                                <h3>Historial de Asistencias</h3>
                                {historial.length > 0 ? (
                                  <ul>
                                    {historial.map((asistencia) => (
                                      <li key={asistencia.id}>
                                        {new Date(asistencia.fecha).toLocaleString()} - {asistencia.estado} - Nivel de Alcohol: {asistencia.nivelAlcohol}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p>No hay historial disponible.</p>
                                )}
                              </div>
                            </div>
                          )}

                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No hay asistencias registradas.</p>
                )}
              </div>
            </div>
          ) : selectedOption === 'Soporte y Ayuda' ? (
            <div>
              <h2>Soporte y Ayuda</h2>
              <h3>Preguntas Frecuentes (FAQ)</h3>
              <ul>
                <li>
                  <strong>¿Cómo cambio mi contraseña?</strong>
                  <p>Para cambiar su contraseña, dirígete a la sección de configuración de Empleados.</p>
                </li>
                <li>
                  <strong>¿Cómo genero un reporte?</strong>
                  <p>Puedes generar un reporte accediendo a la sección de asistencias en el panel de administración.</p>
                </li>
              </ul>
              <h3>Tutoriales y Documentación</h3>
              <p>Visita nuestra <a href="https://www.youtube.com/watch?v=RSzFju8Ja_o" target="_blank" rel="noopener noreferrer">documentación en línea</a> para más información.</p>
              {/* <h3>Formulario de Contacto</h3>
              <form>
                <div>
                  <label>Nombre:</label>
                  <input type="text" required />
                </div>
                <div>
                  <label>Email:</label>
                  <input type="email" required />
                </div>
                <div>
                  <label>Mensaje:</label>
                  <textarea required></textarea>
                </div>
                <button type="submit">Enviar</button>
              </form> */}
              <h3>Información de Contacto</h3>
              <p>Para más ayuda, puedes contactarnos a: <strong>soporte@cetron.com</strong></p>
            </div>
          ) : selectedOption === 'Bitacora' ? (
            <div>
              <h2 className="title-header">Bitacora</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Empleado ID</th>
                    <th>Sección</th>
                    <th>Acción</th>
                    <th>Detalle</th>
                    <th>Fecha Movimiento</th>
                    <th>Eliminar </th>
                  </tr>
                </thead>
                <tbody>
                  {bitacora.map((movimiento) => (
                    <tr key={movimiento.id}>
                      <td>{movimiento.id}</td>
                      <td>{movimiento.empleado_id}</td>
                      <td>{movimiento.seccion}</td>
                      <td>{movimiento.accion}</td>
                      <td>{movimiento.detalle}</td>
                      <td>{new Date(movimiento.fecha_movimiento).toLocaleString()}</td>
                      <td>
                        <button className="report-button" onClick={() => deleteMovimiento(movimiento.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>) : null}
        </section>
      </div>
    </div>
  );
};

export default AdminComponent;