const express = require('express');
const router = express.Router();

// Import versioned routers
const v1Router = require('./v1/v1Router.routes');

// Mount v1 routes
router.use('/v1', v1Router);

// You can add v2, v3, etc. in the future like:
// const v2Router = require('./v2/v2Router.routes');
// router.use('/v2', v2Router);

module.exports = router;
