// src/scripts/createAdmin.js
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Since we're using TypeScript models but running with Node.js
// we need to handle the model differently in this script
function createAdminUser() {
  console.log('Starting admin user creation...');
  
  // Admin user credentials - in a real app, these would come from env vars or command line args
  const adminData = {
    id: require('uuid').v4(),
    email: 'admin@poliq.com',
    username: 'admin',
    displayName: 'Admin User',
    password: 'admin123!', // This would be much stronger in production
    role: 'admin',
    verificationStatus: 'verified',
    isActive: true,
    accountType: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Read existing users file or create an empty array
  let users = [];
  const usersFilePath = path.join(__dirname, '../data/users.json');
  
  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory at:', dataDir);
  }

  // Check if users file exists
  if (fs.existsSync(usersFilePath)) {
    try {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      users = JSON.parse(data);
      console.log(`Found existing users file with ${users.length} users`);
    } catch (error) {
      console.error('Error reading users file:', error);
      users = [];
    }
  } else {
    console.log('No existing users file found. Will create a new one.');
  }

  // Check if admin already exists
  const existingAdmin = users.find(user => user.email === adminData.email || user.role === 'admin');
  if (existingAdmin) {
    console.log('Admin user already exists:', existingAdmin.email);
    return existingAdmin;
  }

  // Hash password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(adminData.password, salt);

  // Create admin user
  const admin = {
    ...adminData,
    password: hashedPassword
  };

  // Add to users array and save
  users.push(admin);
  
  // Save updated users to file
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  
  console.log(`Admin user created with email: ${admin.email}`);
  console.log('Admin user details:');
  console.log(`  Email: ${admin.email}`);
  console.log(`  Username: ${admin.username}`);
  console.log(`  Password: ${adminData.password} (not hashed version)`);
  console.log(`  Role: ${admin.role}`);
  console.log('\nLogin with these credentials to access the admin dashboard');
  
  return admin;
}

// Run if called directly
if (require.main === module) {
  try {
    createAdminUser();
    console.log('Admin creation script completed successfully');
  } catch (err) {
    console.error('Admin creation script failed:', err);
    process.exit(1);
  }
}

module.exports = { createAdminUser };
