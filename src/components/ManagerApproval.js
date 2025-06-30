import React, { useEffect, useState } from 'react';

const ManagerApproval = ({ workflowId, token }) => {
  const [leaveInfo, setLeaveInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch leave info by workflowId
    fetch(`http://localhost:9091/workflow/details/${workflowId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch leave info: ${res.status}`);
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
    // Call API to trigger transition: PENDING -> MANAGER_APPROVED
    fetch(`http://localhost:9091/workflow/transition/approve`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        workflowId,
        transition: 'MANAGER_APPROVED',
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error(`Approval failed: ${res.status}`);
        return res.text();
      })
      .then(msg => {
        alert('Approved successfully!');
        setSubmitting(false);
        // Optionally refresh data or redirect
      })
      .catch(err => {
        alert(err.message);
        setSubmitting(false);
      });
  };

  if (loading) return <div>Loading leave info...</div>;
  if (error) return <div style={{color: 'red'}}>Error: {error}</div>;
  if (!leaveInfo) return <div>No leave info found.</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', border: '1px solid #ccc' }}>
      <h2>Manager Approval</h2>
      <div>
        <strong>Employee:</strong> {leaveInfo.employeeName}<br />
        <strong>From Date:</strong> {leaveInfo.fromDate}<br />
        <strong>To Date:</strong> {leaveInfo.toDate}<br />
        <strong>Reason:</strong> {leaveInfo.reason}<br />
        <strong>Status:</strong> {leaveInfo.status}<br />
      </div>
      <button 
        onClick={handleApprove} 
        disabled={submitting}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
      >
        {submitting ? 'Approving...' : 'Approve'}
      </button>
    </div>
  );
};

export default ManagerApproval;
