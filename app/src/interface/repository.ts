import * as Domain from '../common/Domain';

export type RepositoryFilter = {
  [column: string]: string | number | string[] | number[];
};

export type APIResponse<T> = {
  data: T;
  hasMore: boolean;
  total: number;
};

export type APIResponseEntity<T> = {
  byId: { [id: string]: T };
  allIds: string[];
};

export type CompetitionsGetResp = {
  profiles: APIResponseEntity<Domain.Profile>;
  competitions: APIResponseEntity<Domain.Competition>;
  competitionFiles: APIResponseEntity<Domain.CompetitionFile>;
};

export type ReactionsGetResp = {
  profiles: APIResponseEntity<Domain.Profile>;
  competitions: APIResponseEntity<Domain.Competition>;
  applications: APIResponseEntity<Domain.Application>;
  competitionFiles: APIResponseEntity<Domain.CompetitionFile>;
  applicationFiles: APIResponseEntity<Domain.ApplicationFile>;
};

export default interface Repository {
  setAuthToken(token: string | null): void;
  verifyEmailResend(): Promise<void>;
  competitionGet(id: string): Promise<APIResponse<CompetitionsGetResp>>;
  competitionsGet(
    limit: number,
    offset: number,
  ): Promise<APIResponse<CompetitionsGetResp>>;
  competitionPost(
    data: {
      title: string;
      requirements: string;
    },
    files: File[],
  ): Promise<{ competition: Domain.Competition }>;
  applicationPost(
    data: { contact: string },
    files: File[],
    competitionId: string,
  ): Promise<void>;
  reactionsGet(
    limit: number,
    offset: number,
  ): Promise<APIResponse<ReactionsGetResp>>;
}
