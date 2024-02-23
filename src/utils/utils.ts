import { IncomingUser } from "../types/userData.ts";

export const parseData = (data: string) => {
  try {
    const obj = JSON.parse(data);
    if (obj.data && obj.data !== '') {
      obj.data = JSON.parse(obj.data);
    }
    return obj;
  } catch (e) {
    throw new Error('Invalid JSON data');
  }
};



export const createErrorPayload = (data: IncomingUser, errorText: string) => {
  return JSON.stringify({
    ...data,
    error: true,
    errorText: "Error: " + errorText,
  });
};

export const createSuccessPayload = (name: string, index: number) => {
  return JSON.stringify({
    name: name,
    index: index,
    error: false,
    errorText: "",
  });
};