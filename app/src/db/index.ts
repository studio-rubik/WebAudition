import Http from './http';
import Repository, {
  APIResponse,
  CompetitionsGetResp,
} from '../interface/repository';

export default class ServerRepository implements Repository {
  client: Http;

  constructor(host: string, port?: number) {
    this.client = new Http(host, port);
  }
  verifyEmailResend(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  competitionGet(id: string): Promise<APIResponse<CompetitionsGetResp>> {
    return this.client.get({ path: 'competitions/:id', params: [id] });
  }

  competitionPost(
    data: {
      title: string;
      requirements: string;
    },
    file: File,
  ): Promise<void> {
    const fd = new FormData();
    fd.append('json', JSON.stringify(data));
    fd.append('minus_one', file);
    return this.client.post(
      {
        path: 'competitions',
      },
      fd,
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

  setAuthToken(token: string | null) {
    this.client.token = token;
  }

  test() {
    return this.client.get({ path: '' });
  }
}
