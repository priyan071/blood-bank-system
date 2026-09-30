import React from 'react';

export default function BloodGroupPill({ bloodGroup, size = 'md' }) {
  if (!bloodGroup) return null;

  return (
    <div className={`blood-pill ${size}`} title={`Blood Group: ${bloodGroup}`}>
      {bloodGroup}
    </div>
  );
}
