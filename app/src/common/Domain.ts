export type User = {
  id: string;
  email: string;
  name: string;
};

export type Competition = {
  id: string;
  createdAt: string;
  updatedAt: string;
  minusOneUrl: string;
  title: string;
  requirements: string;
  userId: string;
};

export type Application = {
  id: string;
  createdAt: string;
  updatedAt: string;
  fileUrl: string;
};
