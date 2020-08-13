import Http from './http';
import Repository, {
  APIResponse,
  CompetitionsGetResp,
  ReactionsGetResp,
} from '../interface/repository';
import * as domain from '../common/Domain';

export default class ServerRepository implements Repository {
  client: Http;

  constructor(host: string, port?: number) {
    this.client = new Http(host, port);
  }
  verifyEmailResend(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  myProfileGet(): Promise<domain.Profile> {
    return this.client.get({ path: 'me/profile' });
  }

  competitionGet(id: string): Promise<APIResponse<CompetitionsGetResp>> {
    return this.client.get({ path: 'competitions/:id', params: [id] });
  }

  competitionPost(
    data: {
      title: string;
      requirements: string;
    },
    files: File[],
  ): Promise<{ competition: domain.Competition }> {
    const fd = new FormData();
    fd.append('json', JSON.stringify(data));
    files.forEach((f, i) => fd.append('file' + i, f));
    return this.client.post(
      {
        path: 'competitions',
      },
      fd,
    );
  }

  competitionCommentPost(
    data: {
      content: string;
    },
    competitionId: string,
  ): Promise<domain.CompetitionComment> {
    return this.client.post(
      {
        path: `competitions/${competitionId}/comments`,
      },
      data,
    );
  }

  competitionsGet(
    limit: number,
    offset: number,
  ): Promise<APIResponse<CompetitionsGetResp>> {
    return this.client.get({
      path: 'competitions',
      queries: { limit, offset },
    });
  }

  applicationPost(
    data: { contact: string },
    files: File[],
    competitionId: string,
  ): Promise<void> {
    const fd = new FormData();
    fd.append('json', JSON.stringify(data));
    files.forEach((f, i) => fd.append('file' + i, f));
    return this.client.post(
      {
        path: `competitions/${competitionId}/applications`,
      },
      fd,
    );
  }

  reactionsGet(
    limit: number,
    offset: number,
  ): Promise<APIResponse<ReactionsGetResp>> {
    return this.client.get({ path: 'reactions', queries: { limit, offset } });
  }

  setAuthToken(token: string | null) {
    this.client.token = token;
  }
}
