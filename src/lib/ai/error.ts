export class AIError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'AIError';
  }
}