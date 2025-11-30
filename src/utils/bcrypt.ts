import bcrypt from 'bcrypt';

export const hashValue = async (value: string, saltRounds: number = 10) => {
  return await bcrypt.hash(value, saltRounds);
};

export const compareHashValue = async (value: string, hashValue: string) => {
  return await bcrypt.compare(value, hashValue);
};
