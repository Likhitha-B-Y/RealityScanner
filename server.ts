/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createFullStackServer } from './backend/server.ts';

createFullStackServer().catch((err) => {
  console.error('[Reality Scanner] Failed to start server:', err);
  process.exit(1);
});
