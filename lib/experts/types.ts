/** Experts API types — mirror Android `ExpertsApiModels.kt` + docs/experts-api. */

export type ExpertsEnvelope<T> = {
  error: boolean;
  message?: string | null;
  data?: T | null;
};

export type ExpertsUser = {
  _id?: string;
  id?: string;
  externalUserId?: string;
  name?: string | null;
  email?: string | null;
  creditBalance?: number;
};

export type ExpertsProfileData = { user: ExpertsUser };
export type ExpertsCreditBalanceData = { creditBalance: number };

export type ExpertsDirectoryItem = {
  _id?: string;
  id?: string;
  name?: string | null;
  displayName?: string | null;
  fullName?: string | null;
  profilePicture?: string | null;
  oneLineDescription?: string | null;
  yearsOfXp?: string | null;
  expertise?: string | null;
  isAvailableForRequests?: boolean;
  supportedCountries?: string[];
  stats?: {
    completedCount?: number | null;
    avgCompletionHoursLast5?: number | null;
    averageRating?: number | null;
    reviewCount?: number;
  } | null;
};

export type ExpertsDirectoryData = { experts: ExpertsDirectoryItem[] };

export type ExpertRequestMedia = {
  obverse: string[];
  reverse: string[];
  edge: string[];
  video?: string | null;
};

export type ExpertRequestPayload = {
  media?: ExpertRequestMedia;
  notes?: string | null;
};

export type ExpertRequestStatus =
  | "offered"
  | "accepted"
  | "completed"
  | "deadline_missed"
  | "cancelled"
  | string;

export type ExpertRequest = {
  _id?: string;
  id?: string;
  displayId?: string | null;
  coinTitle?: string | null;
  coinName?: string | null;
  title?: string | null;
  name?: string | null;
  country?: string | null;
  payload?: ExpertRequestPayload | null;
  status?: ExpertRequestStatus | null;
  assignedExpertId?: string | null;
  reportId?: string | null;
  deadlineAt?: string | null;
  acceptedAt?: string | null;
  submittedAt?: string | null;
  completedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ExpertRequestData = {
  request: ExpertRequest;
  creditBalance?: number;
};

export type ExpertRequestsData = {
  requests: ExpertRequest[];
};

export type ExpertReportContentField = {
  key?: string;
  label?: string;
  value?: string | number | boolean | null;
  type?: string;
};

export type ExpertReport = {
  _id?: string;
  id?: string;
  requestId?: string;
  authenticity?: string | null;
  contentFields?: ExpertReportContentField[];
  attachments?: { url?: string; type?: string; label?: string }[];
  coinTitle?: string | null;
  expertDisplayName?: string | null;
  submittedAt?: string | null;
};

export type ExpertReportData = { report: ExpertReport };

export function expertRequestId(r: ExpertRequest): string {
  return (r._id || r.id || "").trim();
}

export function expertDisplayTitle(r: ExpertRequest): string {
  return (
    [r.coinTitle, r.coinName, r.title, r.name].find((s) => typeof s === "string" && s.trim())?.trim() ||
    "Coin Evaluation"
  );
}

export function expertDirectoryName(e: ExpertsDirectoryItem): string {
  return (
    [e.name, e.displayName, e.fullName].find((s) => typeof s === "string" && s.trim())?.trim() || "Expert"
  );
}
