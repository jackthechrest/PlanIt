type RegisterRequest = {
  username: string;
  displayName: string;
  email: string;
  password: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

type UserIdParam = {
  targetUserId: string;
};

type VerifyRequest = {
  verifyCode: string;
};

type EventRequest = {
  eventID: string;
  eventName: string;
  startYear: number;
  startMonth: number;
  startDay: number;
  startHour: number;
  startMinute: number;
  stopYear: number;
  stopMonth: number;
  stopDay: number;
  stopHour: number;
  stopMinute: number;
  description: string;
  location: string;
  visibilityLevel: EventVisibility;
};

type ReportRequest = {
  reportType: ReportType;
  contentId: string;
}