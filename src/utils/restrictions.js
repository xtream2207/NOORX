const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const RESTRICTIONS_FILE = path.join(__dirname, '../../data/restrictions.json');

// Ensure data directory exists
function ensureDataDir() {
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        logger.info('📂 Data directory created');
    }
}

// Load restrictions from file
function loadRestrictions() {
    ensureDataDir();
    try {
        if (fs.existsSync(RESTRICTIONS_FILE)) {
            const data = fs.readFileSync(RESTRICTIONS_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (err) {
        logger.error('❌ Error loading restrictions:', err.message);
    }
    return [];
}

// Save restrictions to file
function saveRestrictions(restrictions) {
    try {
        ensureDataDir();
        fs.writeFileSync(RESTRICTIONS_FILE, JSON.stringify(restrictions, null, 2));
    } catch (err) {
        logger.error('❌ Error saving restrictions:', err.message);
    }
}

// Add restricted user
function addRestrictedUser(userId, reason = 'No reason provided') {
    try {
        const restrictions = loadRestrictions();
        
        // Check if already restricted
        if (restrictions.some(r => r.userId === userId)) {
            logger.warn(`⚠️ User ${userId} is already restricted`);
            return false;
        }

        const restriction = {
            userId,
            reason,
            restrictedAt: new Date().toISOString(),
            restrictedBy: 'admin'
        };

        restrictions.push(restriction);
        saveRestrictions(restrictions);
        logger.info(`🚫 User restricted: ${userId} - Reason: ${reason}`);
        return true;
    } catch (err) {
        logger.error('❌ Error adding restriction:', err.message);
        return false;
    }
}

// Remove restricted user
function removeRestrictedUser(userId) {
    try {
        const restrictions = loadRestrictions();
        const filtered = restrictions.filter(r => r.userId !== userId);
        
        if (filtered.length === restrictions.length) {
            logger.warn(`⚠️ User ${userId} was not restricted`);
            return false;
        }

        saveRestrictions(filtered);
        logger.info(`✅ User unrestricted: ${userId}`);
        return true;
    } catch (err) {
        logger.error('❌ Error removing restriction:', err.message);
        return false;
    }
}

// Check if user is restricted
function isUserRestricted(userId) {
    try {
        const restrictions = loadRestrictions();
        return restrictions.some(r => r.userId === userId);
    } catch (err) {
        logger.error('❌ Error checking restriction:', err.message);
        return false;
    }
}

// Get all restricted users
function getRestrictedUsers() {
    try {
        return loadRestrictions();
    } catch (err) {
        logger.error('❌ Error getting restricted users:', err.message);
        return [];
    }
}

// Get restriction details
function getRestrictionDetails(userId) {
    try {
        const restrictions = loadRestrictions();
        return restrictions.find(r => r.userId === userId) || null;
    } catch (err) {
        logger.error('❌ Error getting restriction details:', err.message);
        return null;
    }
}

// Clear all restrictions (use with caution)
function clearAllRestrictions() {
    try {
        ensureDataDir();
        fs.writeFileSync(RESTRICTIONS_FILE, JSON.stringify([], null, 2));
        logger.warn('⚠️ All restrictions cleared');
        return true;
    } catch (err) {
        logger.error('❌ Error clearing restrictions:', err.message);
        return false;
    }
}

// Batch restrict users
function batchRestrictUsers(userIds, reason = 'Batch restriction') {
    try {
        let successCount = 0;
        userIds.forEach(userId => {
            if (addRestrictedUser(userId, reason)) {
                successCount++;
            }
        });
        logger.info(`✅ Batch restriction: ${successCount}/${userIds.length} users restricted`);
        return successCount;
    } catch (err) {
        logger.error('❌ Error in batch restriction:', err.message);
        return 0;
    }
}

// Batch unrestrict users
function batchUnrestrictUsers(userIds) {
    try {
        let successCount = 0;
        userIds.forEach(userId => {
            if (removeRestrictedUser(userId)) {
                successCount++;
            }
        });
        logger.info(`✅ Batch unrestriction: ${successCount}/${userIds.length} users unrestricted`);
        return successCount;
    } catch (err) {
        logger.error('❌ Error in batch unrestriction:', err.message);
        return 0;
    }
}

module.exports = {
    addRestrictedUser,
    removeRestrictedUser,
    isUserRestricted,
    getRestrictedUsers,
    getRestrictionDetails,
    clearAllRestrictions,
    batchRestrictUsers,
    batchUnrestrictUsers
};

