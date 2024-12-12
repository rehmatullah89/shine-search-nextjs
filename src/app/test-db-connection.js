// test-db-connection.js

import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://sbruser:xlma2190@storm.mindblaze.net/sbrdb';

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testConnection();
