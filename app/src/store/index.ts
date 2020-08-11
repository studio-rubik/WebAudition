import create from 'zustand';
import produce from 'immer';

import * as domain from '../common/Domain';
import { APIResponseEntity } from '../interface/repository';

export type State = {
  set: (fn: SetState) => void;
  initialize: () => void;
  directEntry: boolean;
  profiles: APIResponseEntity<domain.Profile>;
  competitions: APIResponseEntity<domain.Competition>;
  applications: APIResponseEntity<domain.Application>;
};

type SetState = (state: State) => void;

const emptyEntity = { byId: {}, allIds: [] };

const initialState = {
  profiles: emptyEntity,
  competitions: emptyEntity,
  applications: emptyEntity,
};

export const [useStore, api] = create<State>((setState, getState) => ({
  set: (fn) => setState(produce(fn)),
  initialize: () => setState(initialState),
  directEntry: false,
  ...initialState,
}));
