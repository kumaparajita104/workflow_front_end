import React, { useEffect, useState } from 'react';

const HrApproval = ({ workflowId, token }) => {
  const [leaveInfo, setLeaveInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:9091/workflow/details/${workflowId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch leave details');
        return res.json();
      })
      .then(data => {
        setLeaveInfo(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [workflowId, token]);

  const handleApprove = () => {
    setSubmitting(true);
    fetch(`http://localhost:9091/workflow/transition/HR_APPROVED`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ workflowId }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Approval failed');
        return res.text();
      })
      .then(msg => {
        alert(`HR Approval successful: ${msg}`);
        setSubmitting(false);
        // Optionally redirect or notify parent to refresh dashboard
      })
      .catch(err => {
        alert('Approval error: ' + err.message);
        setSubmitting(false);
      });
  };

  if (loading) return <div>Loading leave information...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h3>HR Approval - Leave Request Details</h3>
      <p><strong>Employee:</strong> {leaveInfo.employeeName}</p>
      <p><strong>From Date:</strong> {leaveInfo.fromDate}</p>
      <p><strong>To Date:</strong> {leaveInfo.toDate}</p>
      <p><strong>Reason:</strong> {leaveInfo.reason}</p>
      <p><strong>Current Status:</strong> {leaveInfo.status}</p>

      <button onClick={handleApprove} disabled={submitting}>
        {submitting ? 'Approving...' : 'Approve as HR'}
      </button>
    </div>
  );
};

export default HrApproval;
