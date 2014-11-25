module.exports = {
    env: {
        serverPort: parseInt(process.env.PORT) || 80,
        sessionSecret: process.env.SESSION_SECRET || 'NO_SESSION_SECRET',
        dbConnString: process.env.DB || 'mongodb://localhost:27017/chronicle'
    }
}