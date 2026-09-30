const BloodUnit = require('../models/BloodUnit');

async function generateUnitId() {
  const currentYear = new Date().getFullYear();
  const count = await BloodUnit.countDocuments();
  const nextSeq = (count + 1).toString().padStart(4, '0');
  let unitId = `BLD-${currentYear}-${nextSeq}`;

  // Check collision just in case
  const exists = await BloodUnit.findOne({ unitId });
  if (exists) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    unitId = `BLD-${currentYear}-${randomSuffix}`;
  }

  return unitId;
}

function calculateExpiryDate(collectionDate, componentType) {
  const date = new Date(collectionDate || Date.now());
  switch (componentType) {
    case 'PLATELETS':
      // 5 days shelf life
      date.setDate(date.getDate() + 5);
      break;
    case 'RED_BLOOD_CELLS':
      // 42 days shelf life
      date.setDate(date.getDate() + 42);
      break;
    case 'PLASMA':
      // 365 days shelf life (frozen)
      date.setDate(date.getDate() + 365);
      break;
    case 'WHOLE_BLOOD':
    default:
      // 35 days shelf life
      date.setDate(date.getDate() + 35);
      break;
  }
  return date;
}

module.exports = {
  generateUnitId,
  calculateExpiryDate,
};
