const { app } = require('../server/src/server');
const { connectDB } = require('../server/src/config/db');
const User = require('../server/src/models/User');
const { seedData } = require('../server/src/seeds/seed');

let isSeeded = false;

module.exports = async (req, res) => {
  try {
    await connectDB();
    if (!isSeeded) {
      try {
        const count = await User.countDocuments();
        if (count === 0) {
          console.log('[Vercel Serverless] Database empty. Running initial seeder...');
          await seedData(false);
        }
        isSeeded = true;
      } catch (seedErr) {
        console.warn('[Vercel Serverless] Auto-seed check warning:', seedErr.message);
      }
    }
  } catch (err) {
    console.error('[Vercel Serverless] Database connection failure:', err.message);
  }

  return app(req, res);
};
