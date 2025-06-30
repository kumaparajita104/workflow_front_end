import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateWorkflow = () => {
  const [formType, setFormType] = useState('');
  const [statesInput, setStatesInput] = useState('');
  const [transitionsJson, setTransitionsJson] = useState('');
  const navigate = useNavigate();

  const handleWorkflowSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const states = JSON.parse(statesInput);
      const transitions = JSON.parse(transitionsJson);

      if (!Array.isArray(states) || !Array.isArray(transitions)) {
        alert('States and transitions must both be arrays.');
        return;
      }

      const payload = {
        formType,
        states,
        transitions,
      };

      const res = await fetch('http://localhost:9091/admin/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to save workflow');
      }

      const msg = await res.text();
      alert(msg);
      navigate('/');
    } catch (err) {
      alert('Error saving workflow: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: 'auto' }}>
      <h2>Create Workflow</h2>
      <form onSubmit={handleWorkflowSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Form Type:</label>
          <input
            type="text"
            value={formType}
            onChange={e => setFormType(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>States (JSON Array):</label>
          <textarea
            rows={4}
            value={statesInput}
            onChange={e => setStatesInput(e.target.value)}
            placeholder='e.g. ["PENDING", "APPROVED", "REJECTED"]'
            required
            style={{ width: '100%', padding: '0.5rem', fontFamily: 'monospace' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Transitions (JSON Array):</label>
          <textarea
            rows={10}
            value={transitionsJson}
            onChange={e => setTransitionsJson(e.target.value)}
            placeholder={`e.g.\n[\n  {\n    "from": "PENDING",\n    "to": "APPROVED",\n    "allowedRoles": ["manager"]\n  }\n]`}
            required
            style={{ width: '100%', padding: '0.5rem', fontFamily: 'monospace' }}
          />
        </div>
        <button type="submit" style={{ padding: '0.5rem 1.5rem' }}>
          Save Workflow
        </button>
      </form>
    </div>
  );
};

export default CreateWorkflow;
