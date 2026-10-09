import mongoose from 'mongoose';

export default async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is required. Configure server/.env first.');
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB connected');
}
