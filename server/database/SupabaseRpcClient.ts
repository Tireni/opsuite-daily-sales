/** The repository needs RPC execution, not access to database credentials. */
export interface RpcClient {
  call<T>(name: string, args?: Record<string, unknown>): Promise<T>;
}

export class SupabaseRpcClient implements RpcClient {
  readonly #environment: NodeJS.ProcessEnv;

  constructor(environment: NodeJS.ProcessEnv = process.env) {
    this.#environment = environment;
  }

  async call<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
    const url = this.#environment.SUPABASE_URL;
    const key = this.#environment.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Database configuration missing');
    const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      console.error('Database request failed', name, response.status);
      throw new Error('Database request failed');
    }
    return response.json() as Promise<T>;
  }
}
