import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = status.toUpperCase();
  let badgeClass = 'badge ';

  switch (normalized) {
    case 'AVAILABLE':
    case 'PASSED':
    case 'ELIGIBLE':
    case 'FULFILLED':
    case 'COMPLETED':
      badgeClass += 'badge-available';
      break;

    case 'PENDING':
    case 'RESERVED':
    case 'SCHEDULED':
    case 'URGENT':
    case 'NORMAL':
    case 'PENDING_CHECK':
      badgeClass += 'badge-pending';
      break;

    case 'CRITICAL':
    case 'FAILED':
    case 'DISCARDED':
    case 'INELIGIBLE':
    case 'REJECTED':
      badgeClass += 'badge-critical';
      break;

    case 'ISSUED':
      badgeClass += 'badge-issued';
      break;

    case 'EXPIRED':
    case 'CANCELLED':
    case 'NO_SHOW':
    default:
      badgeClass += 'badge-expired';
      break;
  }

  return (
    <span className={badgeClass}>
      {normalized === 'CRITICAL' && '⚡ '}
      {normalized.replace('_', ' ')}
    </span>
  );
}
