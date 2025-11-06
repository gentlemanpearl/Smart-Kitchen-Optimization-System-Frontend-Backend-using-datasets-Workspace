# MongoDB Setup Instructions

## Quick Setup Options

### Option 1: MongoDB Atlas (Cloud - Recommended, No Installation Required)

1. **Create Free Account**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Sign up for free (no credit card required)

2. **Create Free Cluster**
   - Click "Build a Database"
   - Choose "FREE" (M0) tier
   - Select a cloud provider and region
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
   - Set privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your current IP address
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/smart-kitchen?retryWrites=true&w=majority`

6. **Set Environment Variable**
   - Create `.env` file in `backend` folder:
   ```
   DB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/smart-kitchen?retryWrites=true&w=majority
   ```

7. **Seed Database**
   ```bash
   cd backend
   npm run seed
   ```

### Option 2: Install MongoDB Locally

#### Windows

1. **Download MongoDB**
   - Visit: https://www.mongodb.com/try/download/community
   - Select Windows x64
   - Download MSI installer

2. **Install MongoDB**
   - Run the installer
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)
   - Install MongoDB Compass (optional GUI)

3. **Verify Installation**
   - MongoDB should start automatically
   - Or start manually: Open Services → Find "MongoDB" → Start

4. **Seed Database**
   ```bash
   cd backend
   npm run seed
   ```

#### macOS

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Seed database
cd backend
npm run seed
```

#### Linux

```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Seed database
cd backend
npm run seed
```

## After Setup

1. **Restart Backend Server**
   ```bash
   cd backend
   npm run unified
   ```

2. **Verify Data**
   - Open frontend: http://localhost:5173
   - Check Dashboard - should show inventory items
   - Check Inventory page - should show seeded items
   - Check Waste Management - should show waste records

## Troubleshooting

### Connection Refused
- Make sure MongoDB is running
- Check if port 27017 is available
- Verify connection string in `.env` file

### Authentication Failed
- Check username and password in connection string
- Verify database user has correct permissions

### No Data Showing
- Run seed script: `npm run seed`
- Check MongoDB connection in backend logs
- Verify frontend API URL is `http://localhost:5000`

