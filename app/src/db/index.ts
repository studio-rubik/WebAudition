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
