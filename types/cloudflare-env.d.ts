export {};

declare global {
  interface CloudflareEnv {
    ARTICLE_VIEWS?: {
      get(key: string): Promise<string | null>;
      put(
        key: string,
        value: string,
        options?: { expirationTtl?: number }
      ): Promise<void>;
    };
  }
}
