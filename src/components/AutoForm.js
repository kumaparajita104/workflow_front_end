import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const AutoForm = () => {
  const location = useLocation();
  const formType = location.state?.formType || '';
  const [formSchema, setFormSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!formType) return;

    fetch(`http://localhost:9091/forms/${formType}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('Fetched form template:', data);
        const parsedSchema = JSON.parse(data.schemaJson);
        setFormSchema(parsedSchema);
      })
      .catch(err => alert('Error loading form schema: ' + err.message));
  }, [formType, token]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    fetch('http://localhost:9091/forms/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ formType, data: formData }),
    })
      .then(res => res.text())
      .then(msg => alert(msg))
      .catch(err => alert('Submission failed: ' + err.message));
  };

  if (!formSchema) return <div>Loading form...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{formType} Form</h2>
      <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
        {formSchema.map(field => (
          <div key={field.name} style={{ marginBottom: '1rem' }}>
            <label>{field.label}:</label><br />
            <input
              type={field.type}
              value={formData[field.name] || ''}
              onChange={e => handleInputChange(field.name, e.target.value)}
              required
            />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AutoForm;
