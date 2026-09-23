/** Friendly aliases over the generated OpenAPI types. Never hand-write response shapes. */
import type { components } from './schema';

type Schemas = components['schemas'];

export type Health = Schemas['HealthRead'];

/** The error envelope is produced by exception handlers, so it is not part of the OpenAPI spec. */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: { field?: string | null; message: string }[] | null;
    request_id?: string | null;
  };
}
