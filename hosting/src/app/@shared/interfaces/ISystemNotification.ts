
export interface ISystemNotification {
  _id?: string;
  title: string;
  description: string;
  date?: Date;
  icon?: string;
  status: ENotificationStatus;
  path?: string
  readStatus?: boolean,
  duration?: number,
  tag?: string;
}

export enum ENotificationStatus {
  success = 'success',
  info = 'info',
  warning = 'warning',
  danger = 'danger'
}
