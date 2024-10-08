export type Contact = {
  id: string;
  createdAt: number;
  first: string;
  last: string;
  avatar: string;
  twitter: string;
  notes: string;
  favorite: boolean;
};

export type FakeCache = {
  [key: string]: boolean;
};
