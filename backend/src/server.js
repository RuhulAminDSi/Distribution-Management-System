import app from './app.js';
import { initializeDatabase } from './config/database.js';
import { notificationScanner } from './services/notificationScanner.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Run initial scan on startup
    setTimeout(async () => {
      try {
        console.log('[Scanner] Running initial notification scan...');
        await notificationScanner.runAllScans();
        console.log('[Scanner] Initial scan complete');
      } catch (error) {
        console.error('[Scanner] Initial scan error:', error.message);
      }
    }, 5000);

    // Scan every 5 minutes
    setInterval(async () => {
      try {
        await notificationScanner.runAllScans();
      } catch (error) {
        console.error('[Scanner] Scan error:', error.message);
      }
    }, 5 * 60 * 1000);

    // Cleanup old notifications daily
    setInterval(async () => {
      try {
        await notificationScanner.cleanupOldNotifications();
      } catch (error) {
        console.error('[Scanner] Cleanup error:', error.message);
      }
    }, 24 * 60 * 60 * 1000);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
