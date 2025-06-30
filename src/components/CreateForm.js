import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateForm = () => {
  const [formType, setFormType] = useState('');
  const [title, setTitle] = useState('');
  const [fieldsJson, setFieldsJson] = useState('');
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const fields = JSON.parse(fieldsJson); // parse field JSON array
      const payload = {
        formType,
        title,
        fields
      };

      const res = await fetch('http://localhost:9091/admin/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const msg = await res.text();
      alert(msg);
      navigate('/'); // Go back to Dashboard
    } catch (err) {
      alert('Error creating form: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Create Form Template</h2>
      <form onSubmit={handleFormSubmit}>
        <div>
          <label>Form Type:</label>
          <input value={formType} onChange={e => setFormType(e.target.value)} required />
        </div>
        <div>
          <label>Title:</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Fields (JSON):</label>
          <textarea
            rows={10}
            value={fieldsJson}
            onChange={e => setFieldsJson(e.target.value)}
            placeholder={`e.g.\n[\n  {"name":"reason","label":"Reason","type":"text"},\n  {"name":"startDate","label":"Start Date","type":"date"}\n]`}
            required
          />
        </div>
        <button type="submit">Go</button>
      </form>
    </div>
  );
};

export default CreateForm;
