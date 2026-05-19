import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  let retries = 5;
  while (retries > 0) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        tls: true,
        tlsAllowInvalidCertificates: true,
      });
      console.log('✅ MongoDB Atlas connected successfully');
      return;
    } catch (error) {
      retries -= 1;
      console.error(`❌ MongoDB connection failed. Retries left: ${retries}`);
      if (retries === 0) throw error;
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

export default connectDB;
