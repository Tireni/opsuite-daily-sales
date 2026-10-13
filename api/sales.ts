import { SupabaseRpcClient } from '../server/database/SupabaseRpcClient.js';
import { SupabaseSalesRepository } from '../server/repositories/SupabaseSalesRepository.js';
import { createSalesHandler } from '../server/handlers/salesHandler.js';

// Composition root: production always uses the real Supabase implementation.
export default createSalesHandler(new SupabaseSalesRepository(new SupabaseRpcClient()));
