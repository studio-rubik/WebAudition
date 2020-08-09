export type User = {
  id: string;
  email: string;
  name: string;
};

export type Profile = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  avatar: string;
  userId: string;
};

export type Competition = {
  id: string;
  createdAt: string;
  updatedAt: string;
  minusOneUrl: string;
  title: string;
  requirements: string;
  userId: string;
  profile: string;
};

export type Application = {
  id: string;
  competition: string;
  createdAt: string;
  updatedAt: string;
  fileUrl: string;
  userId: string;
  profile: string;
};
