import { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';

const API_URL = 'https://jobtrack-api-r4i9.onrender.com';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [applications, setApplications] = useState([]);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('APPLIED');
  const [appliedDate, setAppliedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (token) {
      fetchApplications();
    }
  }, [token]);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, { headers: authHeaders() });
      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      setApplications(data);
      setError('');
    } catch (err) {
      setError('Could not connect to backend. Is your Spring Boot app running?');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCompany('');
    setRole('');
    setStatus('APPLIED');
    setAppliedDate('');
    setNotes('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { company, role, status, appliedDate, notes };

    try {
      if (editingId) {
        await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
      }
      resetForm();
      fetchApplications();
    } catch (err) {
      setError('Failed to save application.');
    }
  };

  const handleEdit = (app) => {
    setEditingId(app.id);
    setCompany(app.company || '');
    setRole(app.role || '');
    setStatus(app.status || 'APPLIED');
    setAppliedDate(app.appliedDate || '');
    setNotes(app.notes || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: authHeaders() });
      fetchApplications();
    } catch (err) {
      setError('Failed to delete application.');
    }
  };

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setApplications([]);
  };

  const filteredApplications =
      filterStatus === 'ALL'
          ? applications
          : applications.filter((app) => app.status === filterStatus);

  // Not logged in — show the login/register screen instead of the app
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
      <div className="App">
        <div className="header-row">
          <h1>JobTrack</h1>
          <button onClick={handleLogout} className="logout-btn">Log Out</button>
        </div>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <h2>{editingId ? 'Edit Application' : 'Add New Application'}</h2>
          <input type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} required />
          <input type="text" placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} required />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <input type="date" value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} />
          <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button type="submit">{editingId ? 'Update' : 'Add'}</button>
          {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
        </form>

        <div className="filter">
          <label>Filter by status: </label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">All</option>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {loading ? (
            <p>Loading...</p>
        ) : (
            <table>
              <thead>
              <tr>
                <th>Company</th><th>Role</th><th>Status</th><th>Applied Date</th><th>Notes</th><th>Actions</th>
              </tr>
              </thead>
              <tbody>
              {filteredApplications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.company}</td>
                    <td>{app.role}</td>
                    <td>{app.status}</td>
                    <td>{app.appliedDate}</td>
                    <td>{app.notes}</td>
                    <td>
                      <button onClick={() => handleEdit(app)}>Edit</button>
                      <button onClick={() => handleDelete(app.id)}>Delete</button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
        )}
      </div>
  );
}

export default App;