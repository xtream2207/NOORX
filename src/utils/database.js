// In-memory database for production-ready bot
const database = {
  users: {}, // { userId: { sessionId, phoneNumber, connected, createdAt, restrictedUntil } }
  sessions: {}, // { userId: socketInstance }
  pairingCodes: {}, // { userId: { code, expiresAt } }
  restrictedUsers: [], // Array of restricted phone numbers
};

const db = {
  // User management
  addUser: (userId, phoneNumber, sessionId) => {
    database.users[userId] = {
      userId,
      phoneNumber,
      sessionId,
      connected: false,
      createdAt: new Date(),
      restrictedUntil: null,
    };
    return database.users[userId];
  },

  getUser: (userId) => database.users[userId],

  getAllUsers: () => Object.values(database.users),

  getConnectedUsers: () =>
    Object.values(database.users).filter((u) => u.connected),

  updateUser: (userId, updates) => {
    if (database.users[userId]) {
      database.users[userId] = {
        ...database.users[userId],
        ...updates,
      };
      return database.users[userId];
    }
    return null;
  },

  deleteUser: (userId) => {
    delete database.users[userId];
    delete database.sessions[userId];
    return true;
  },

  // Session management
  addSession: (userId, socket) => {
    database.sessions[userId] = socket;
  },

  getSession: (userId) => database.sessions[userId],

  getAllSessions: () => database.sessions,

  removeSession: (userId) => {
    delete database.sessions[userId];
  },

  // Pairing code management
  setPairingCode: (userId, code) => {
    database.pairingCodes[userId] = {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    };
  },

  getPairingCode: (userId) => {
    const pair = database.pairingCodes[userId];
    if (pair && pair.expiresAt > Date.now()) {
      return pair.code;
    }
    delete database.pairingCodes[userId];
    return null;
  },

  // Restriction management
  restrictUser: (phoneNumber, duration = 30 * 24 * 60 * 60 * 1000) => {
    // 30 days by default
    const restriction = {
      phoneNumber,
      restrictedUntil: Date.now() + duration,
      createdAt: new Date(),
    };
    database.restrictedUsers.push(restriction);
    return restriction;
  },

  unrestrictUser: (phoneNumber) => {
    database.restrictedUsers = database.restrictedUsers.filter(
      (r) => r.phoneNumber !== phoneNumber
    );
  },

  isUserRestricted: (phoneNumber) => {
    const restriction = database.restrictedUsers.find(
      (r) => r.phoneNumber === phoneNumber
    );
    if (!restriction) return false;
    if (restriction.restrictedUntil > Date.now()) {
      return true;
    }
    db.unrestrictUser(phoneNumber);
    return false;
  },

  getRestrictedUsers: () => database.restrictedUsers,

  // Statistics
  getStats: () => ({
    totalUsers: Object.keys(database.users).length,
    connectedUsers: Object.values(database.users).filter((u) => u.connected)
      .length,
    restrictedUsers: database.restrictedUsers.length,
    totalSessions: Object.keys(database.sessions).length,
  }),

  // Export/Import for persistence
  exportData: () => JSON.stringify(database, null, 2),

  importData: (data) => {
    try {
      const imported = JSON.parse(data);
      Object.assign(database, imported);
      return true;
    } catch (err) {
      return false;
    }
  },
};

module.exports = db;

