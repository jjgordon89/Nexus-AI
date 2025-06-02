/**
 * Server Mock Service Worker setup for Node.js environments (tests)
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);