declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'production' | 'test';
    PORT?: string;
    DATABASE_URL?: string;
    CORS_ORIGIN?: string;
    CSRF_SECRET?: string;
  }
}
