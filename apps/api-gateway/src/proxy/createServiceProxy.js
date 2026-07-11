const { createProxyMiddleware } = require("http-proxy-middleware");

const createServiceProxy = (
    serviceName,
    target,
    pathRewrite = {}
) => {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite,
        proxyTimeout: 10000,
        timeout: 10000,

        on: {
            proxyReq: (proxyReq, req) => {
                console.log(
                    `[${serviceName}] ${req.method} ${req.originalUrl} -> ${target}${proxyReq.path}`
                );
            },

            proxyRes: (proxyRes, req) => {
                console.log(
                    `[${serviceName}] ${proxyRes.statusCode} ${req.method} ${req.originalUrl}`
                );
            },

            error: (err, req, res) => {
                console.error(`[${serviceName}] ${err.message}`);

                if (!res.headersSent) {
                    res.status(502).json({
                        success: false,
                        message: `${serviceName} is unavailable.`,
                    });
                }
            },
        },
    });
};

module.exports = createServiceProxy;