/**
 * Browser Mock Service Worker setup for browser environments
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);