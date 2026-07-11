import { PaginatedResponse } from '@pandorlabs/types';

/**
 * Implements the shared wire contract, so a change to the envelope breaks the
 * build here rather than silently at the frontend.
 */
export class PaginatedResponseDto<T> implements PaginatedResponse<T> {
  data!: T[];
  pagination!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
