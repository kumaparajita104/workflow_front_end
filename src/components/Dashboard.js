import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from './UserProvider';
import { useNavigate } from 'react-router-dom';
import CreateWorkflow from './CreateWorkflow';

const Dashboard = ({ token, logout }) => {
  const { user, loading } = useContext(UserContext);
  const [formSchema, setFormSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [pendingRequests, setPendingRequests] = useState([]);
  const [leaveDetails, setLeaveDetails] = useState({});
  const [adminJsonInput, setAdminJsonInput] = useState(`{
  "formType": "LEAVE",
  "title": "Leave Application Form",
  "fields": [
    {
      "name": "employeeName",
      "type": "text",
      "label": "Employee Name"
    },
    {
      "name": "leaveType",
      "type": "text",
      "label": "Leave Type"
    },
    {
      "name": "startDate",
      "type": "date",
      "label": "Start Date"
    },
    {
      "name": "endDate",
      "type": "date",
      "label": "End Date"
    },
    {
      "name": "reason",
      "type": "text",
      "label": "Reason for Leave"
    }
  ]
}`);
  const [adminGeneratedSchema, setAdminGeneratedSchema] = useState(null);
  const [adminFormData, setAdminFormData] = useState({});
  const [adminView, setAdminView] = useState('form');

  const navigate = useNavigate();

  // ==== EMPLOYEE: Fetch form schema ====
  useEffect(() => {
    if (!user) return;
    if (user.roles.includes('client_employee')) {
      fetch('http://localhost:9091/admin/form-generate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formType: 'LEAVE' }),
      })
        .then(res => res.json())
        .then(data => setFormSchema(data))
        .catch(err => console.error('Failed to load schema:', err));
    }
  }, [user, token]);

  // ==== MANAGER/HR: Fetch pending workflows and their details ====
  useEffect(() => {
    if (!user) return;

    const endpoint = user.roles.includes('client_manager')
      ? 'manager'
      : user.roles.includes('client_hr')
      ? 'hr'
      : null;

    if (!endpoint) return;

    fetch(`http://localhost:9091/workflow/pending/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setPendingRequests(data);
        data.forEach(req => fetchLeaveDetails(req.id));
      })
      .catch(console.error);
  }, [user, token]);

  // ==== Fetch leave details for a workflow ====
  const fetchLeaveDetails = async (workflowId) => {
    try {
      const res = await fetch(`http://localhost:9091/workflow/details/${workflowId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLeaveDetails(prev => ({ ...prev, [workflowId]: data }));
      }
    } catch (err) {
      console.error('Failed to fetch leave details', err);
    }
  };

  // ==== Submit employee leave form ====
  const handleDynamicFormSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:9091/forms/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        formType: 'LEAVE',
        data: formData,
      }),
    })
      .then(res => res.text())
      .then(alert)
      .catch(err => alert('Form submission failed: ' + err.message));
  };

  // ==== Approve workflow ====
  const approveRequest = (workflowId, nextState) => {
    fetch(`http://localhost:9091/workflow/transition/${nextState}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workflowId }),
    })
      .then(res => res.text())
      .then(alert)
      .catch(err => alert('Approval failed: ' + err.message));
  };

  // ==== Admin form creation ====
  const handleAdminGenerateForm = () => {
    try {
      const parsed = JSON.parse(adminJsonInput);
      if (!parsed.formType || !parsed.title || !Array.isArray(parsed.fields)) {
        alert('Invalid JSON structure');
        return;
      }
      setAdminGeneratedSchema(parsed);
      setAdminFormData({});
    } catch {
      alert('Invalid JSON');
    }
  };

  const handleAdminFormSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:9091/admin/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: adminJsonInput,
    })
      .then(res => res.text())
      .then(msg => alert('Form template saved'))
      .catch(err => alert('Error: ' + err.message));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard" style={{ padding: '2rem' }}>
      <h2>Welcome, {user.username}</h2>
      <button onClick={logout} style={{ marginBottom: '1rem' }}>Logout</button>

      {/* ==== EMPLOYEE ==== */}
      {user.roles.includes('client_employee') && (
        <>
          <h3>Submit Leave Request</h3>
          {formSchema ? (
            <form onSubmit={handleDynamicFormSubmit}>
              {formSchema.fields.map(field => (
                <div key={field.name} style={{ marginBottom: '1rem' }}>
                  <label>{field.label}:</label>
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    required
                  />
                </div>
              ))}
              <button type="submit">Submit</button>
            </form>
          ) : (
            <p>Loading form schema...</p>
          )}
        </>
      )}

      {/* ==== MANAGER ==== */}
      {user.roles.includes('client_manager') && (
        <>
          <h3>Manager Pending Approvals</h3>
          {pendingRequests.map(req => {
            const details = leaveDetails[req.id];
            return (
              <div key={req.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
                <p><strong>Workflow ID:</strong> {req.id}</p>
                {details ? (
                  <>
                    <p><strong>Employee Name:</strong> {details.employeeName}</p>
                    <p><strong>Leave Type:</strong> {details.leaveType}</p>
                    <p><strong>From:</strong> {details.startDate}</p>
                    <p><strong>To:</strong> {details.endDate}</p>
                    <p><strong>Reason:</strong> {details.reason}</p>
                    <p><strong>Current State:</strong> {details.currentState}</p>
                  </>
                ) : (
                  <p>Loading leave details...</p>
                )}
                <button onClick={() => approveRequest(req.id, 'MANAGER_APPROVED')}>Approve</button>
                <button onClick={() => {
                if (window.confirm('Are you sure you want to reject this request?')) {
                  approveRequest(req.id, 'REJECTED');
  }
}}>Reject</button>
              </div>
            );
          })}
        </>
      )}

      {/* ==== HR ==== */}
      {user.roles.includes('client_hr') && (
        <>
          <h3>HR Pending Approvals</h3>
          {pendingRequests.map(req => {
            const details = leaveDetails[req.id];
            return (
              <div key={req.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
                <p><strong>Workflow ID:</strong> {req.id}</p>
                {details ? (
                  <>
                    <p><strong>Employee Name:</strong> {details.employeeName}</p>
                    <p><strong>Leave Type:</strong> {details.leaveType}</p>
                    <p><strong>From:</strong> {details.startDate}</p>
                    <p><strong>To:</strong> {details.endDate}</p>
                    <p><strong>Reason:</strong> {details.reason}</p>
                    <p><strong>Current State:</strong> {details.currentState}</p>
                  </>
                ) : (
                  <p>Loading leave details...</p>
                )}
                <button onClick={() => approveRequest(req.id, 'HR_APPROVED')}>Approve</button>
                <button onClick={() => {
                if (window.confirm('Are you sure you want to reject this request?')) {
                    approveRequest(req.id, 'REJECTED');
              }
}}>Reject</button>
              </div>
            );
          })}
        </>
      )}

      {/* ==== ADMIN ==== */}
      {user.roles.includes('client_admin') && (
        <>
          <h3>Admin Panel</h3>
          <div style={{ marginBottom: '1rem' }}>
            <button onClick={() => setAdminView('form')} style={{ marginRight: '1rem' }}>Form Creator</button>
            <button onClick={() => setAdminView('workflow')}>Workflow Creator</button>
          </div>

          {/* Form Creator */}
          {adminView === 'form' && (
            <>
              <textarea
                rows={10}
                cols={60}
                value={adminJsonInput}
                onChange={e => setAdminJsonInput(e.target.value)}
                style={{ marginBottom: '1rem' }}
              />
              <br />
              <button onClick={handleAdminGenerateForm}>Generate Form</button>
              {adminGeneratedSchema && adminGeneratedSchema.fields && (
                <form onSubmit={handleAdminFormSubmit} style={{ marginTop: '1rem' }}>
                  <h3>{adminGeneratedSchema.title}</h3>
                  {adminGeneratedSchema.fields.map(field => (
                    <div key={field.name} style={{ marginBottom: '1rem' }}>
                      <label>{field.label}:</label>
                      <input
                        type={field.type}
                        value={adminFormData[field.name] || ''}
                        onChange={e => setAdminFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                        required
                      />
                    </div>
                  ))}
                  <button type="submit">Save Form Template</button>
                </form>
              )}
            </>
          )}

          {/* Workflow Creator */}
          {adminView === 'workflow' && <CreateWorkflow />}
        </>
      )}
    </div>
  );
};

export default Dashboard;
