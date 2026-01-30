import moment, { type Moment } from 'moment';

export const now = () => {
  return moment().toDate();
};

export const isValidDate = (value: any) => {
  return moment(value).isValid();
};

export const formatDate = (time: any, format: string, opts = { fb: '' }) => {
  if (!time) return opts.fb;
  return moment(time).format(format);
};

export const genDates = (startDate: any, endDate: any) => {
  const start = moment.utc(startDate).startOf('day');
  const end = moment.utc(endDate).startOf('day');

  const dates: Moment[] = [];
  while (start.isSameOrBefore(end)) {
    dates.push(start.clone());
    start.add(1, 'day');
  }
  return dates;
};

export const toDate = (
  time?: any,
  {
    fb = new Date(),
    locale = 'id',
  }: {
    fb?: Date;
    locale?: string;
  } = {}
) => {
  if (!time) return fb;
  return moment(time).locale(locale).toDate();
};
