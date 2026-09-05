const { engines } = require('../package.json');

function checkToolchain(nodeVersion, userAgent = '') {
    const npmVersion = /(?:^|\s)npm\/([^\s]+)/.exec(userAgent)?.[1];
    if (nodeVersion !== engines.node) {
        throw new Error(`Use Node ${engines.node}; found ${nodeVersion}. See .node-version.`);
    }
    if (npmVersion !== engines.npm) {
        throw new Error(`Use npm ${engines.npm}; found ${npmVersion || 'unknown'}. Run npm run check:toolchain after selecting the toolchain.`);
    }
}

if (require.main === module) {
    try {
        checkToolchain(process.versions.node, process.env.npm_config_user_agent);
        console.log(`Toolchain verified: Node ${engines.node}, npm ${engines.npm}`);
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}

module.exports = { checkToolchain };
