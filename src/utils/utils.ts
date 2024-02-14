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
