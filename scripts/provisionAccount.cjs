require('dotenv').config();

const bcrypt = require('bcryptjs');
const db = require('../config/db.cjs');

const [id, fullName, email, role = 'student'] = process.argv.slice(2);
const password = process.env.CAMPUSCARE_PROVISION_PASSWORD;
const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

const validInput = (
  typeof id === 'string' &&
  /^[a-zA-Z0-9-]{1,20}$/.test(id) &&
  typeof fullName === 'string' &&
  fullName.trim().length > 0 &&
  fullName.trim().length <= 100 &&
  /^[^\s@]+@wmsu\.edu\.ph$/i.test(normalizedEmail) &&
  ['student', 'admin'].includes(role) &&
  typeof password === 'string' &&
  password.length >= 8 &&
  Buffer.byteLength(password, 'utf8') <= 72
);

const provisionAccount = async () => {
  if (!validInput) {
    throw new Error(
      'Usage: npm run account:add -- <id> "<full name>" <wmsu-email> [student|admin]. Set CAMPUSCARE_PROVISION_PASSWORD to an 8-72 byte password first.'
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.query(
    `INSERT INTO users (id, full_name, email, password_hash, role, department_id)
     VALUES ($1, $2, $3, $4, $5, NULL)`,
    [id.trim(), fullName.trim(), normalizedEmail, passwordHash, role]
  );
  console.log(`Provisioned ${role} account ${id.trim()}.`);
};

provisionAccount()
  .catch((error) => {
    console.error('Account provisioning failed:', error.code === '23505'
      ? 'That ID or email is already in use.'
      : error.message);
    process.exitCode = 1;
  })
  .finally(() => db.end());