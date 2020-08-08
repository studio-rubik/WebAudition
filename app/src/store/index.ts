import create from 'zustand';
import produce from 'immer';

import * as domain from '../common/Domain';
import { APIResponseEntity } from '../interface/repository';

export type State = {
  set: (fn: SetState) => void;
  competitions: APIResponseEntity<domain.Competition>;
  applications: APIResponseEntity<domain.Application>;
};

type SetState = (state: State) => void;

function emptyEntity() {
  return { byId: {}, allIds: [] };
}

export const [useStore, api] = create<State>((setState, getState) => ({
  set: (fn) => setState(produce(fn)),
  competitions: emptyEntity(),
  applications: emptyEntity(),
}));
