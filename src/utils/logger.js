const chalk = require('chalk');

function timestamp() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
}

function format(parts) {
    return parts
        .map(p => {
            if (p instanceof Error) return p.stack || p.message;
            if (typeof p === 'object' && p !== null) {
                try { return JSON.stringify(p, null, 2); } catch (_) { return String(p); }
            }
            return String(p);
        })
        .join(' ');
}

const logger = {
    info:    (...args) => console.log(chalk.blue(`[${timestamp()}] ℹ️  INFO:`),    format(args)),
    success: (...args) => console.log(chalk.green(`[${timestamp()}] ✅ SUCCESS:`),  format(args)),
    warn:    (...args) => console.log(chalk.yellow(`[${timestamp()}] ⚠️  WARN:`),   format(args)),
    error:   (...args) => console.log(chalk.red(`[${timestamp()}] ❌ ERROR:`),      format(args)),
    debug:   (...args) => {
        if (process.env.DEBUG || process.env.LOG_LEVEL === 'debug') {
            console.log(chalk.cyan(`[${timestamp()}] 🐛 DEBUG:`), format(args));
        }
    },

    // Pino-compatible shim so Baileys does not crash when it calls logger.child()
    level: 'silent',
    child: () => ({
        info:  () => {},
        warn:  () => {},
        error: () => {},
        debug: () => {},
        trace: () => {},
        fatal: () => {},
        child: () => logger.child(),
    }),
    trace: () => {},
    fatal: (...args) => console.log(chalk.bgRed(`[${timestamp()}] 💀 FATAL:`), format(args)),
};

module.exports = logger;
