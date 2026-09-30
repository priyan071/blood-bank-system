const Transaction = require('../models/Transaction');

async function logTransaction({
  transactionType,
  bloodUnit,
  unitId,
  bloodGroup,
  componentType,
  quantity = 1,
  performedBy,
  performedByName,
  recipientHospital,
  patientReference,
  bloodRequest,
  notes,
}) {
  try {
    const transaction = await Transaction.create({
      transactionType,
      bloodUnit: bloodUnit._id || bloodUnit,
      unitId: unitId || bloodUnit.unitId,
      bloodGroup: bloodGroup || bloodUnit.bloodGroup,
      componentType: componentType || bloodUnit.componentType,
      quantity,
      performedBy: performedBy?._id || performedBy,
      performedByName: performedByName || (performedBy ? performedBy.name : 'System Admin'),
      recipientHospital: recipientHospital || '',
      patientReference: patientReference || '',
      bloodRequest: bloodRequest?._id || bloodRequest,
      notes: notes || '',
      timestamp: new Date(),
    });
    return transaction;
  } catch (error) {
    console.error('[AuditLogger] Failed to log transaction:', error.message);
  }
}

module.exports = { logTransaction };
