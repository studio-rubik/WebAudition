import * as Domain from '../common/Domain';

export type RepositoryFilter = {
  [column: string]: string | number | string[] | number[];
};

export type APIResponse<T> = {
  data: T;
  hasMore: boolean;
  total: number;
};

export type CompetitionsGetResp = {
  competitions: Domain.Competition[];
  applications: Domain.Application[];
};

export default interface Repository {
  setAuthToken(token: string | null): void;
  verifyEmailResend(): Promise<void>;
  competitionsGet(
    limit: number,
    offset: number,
  ): Promise<APIResponse<CompetitionsGetResp>>;
}
