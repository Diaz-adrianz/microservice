import moment from 'moment';

export const isNumberString = (value: string) => {
  return /^\d+$/.test(value);
};

export const isBoolString = (value: string) => {
  return value === 'true' || value === 'false';
};

export const isNullString = (value: string) => {
  return value === 'null';
};

export const isDateString = (value: string) => {
  return moment(value, ['DD/MM/YYYY', 'YYYY-MM-DD'], true).isValid();
};

export const isUuidString = (value: string) => {
  if (typeof value !== 'string') return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};
