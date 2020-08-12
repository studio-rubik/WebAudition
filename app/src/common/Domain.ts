export type User = {
  id: string;
  email: string;
  name: string;
};

export type Base = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type Profile = {
  name: string;
  avatar: string;
  userId: string;
} & Base;

export type Competition = {
  title: string;
  requirements: string;
  userId: string;
  profile: string;
} & Base;

export type Application = {
  id: string;
  competition: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  profile: string;
} & Base;

export type File = {
  id: string;
  createdAt: string;
  updatedAt: string;
  key: string;
  url: string;
} & Base;

export type CompetitionFile = {
  competition: string;
} & File;

export type ApplicationFile = {
  application: string;
} & File;
