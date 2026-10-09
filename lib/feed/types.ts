/** Domain models matching Android Feed / Firestore (`PostRepositoryImpl`). */

export type CommunityUser = {
  id?: string | null;
  userId: string;
  name: string;
  profilePictureUrl?: string | null;
};

export type FeedPost = {
  id: string;
  title: string;
  content: string;
  user: CommunityUser | null;
  imageList: string[];
  timestamp: number;
  likeCount: number;
  commentCount: number;
  isBookmarked: boolean;
  isLikedByCurrentUser: boolean;
  isBuySell: boolean;
};

export type FeedReply = {
  id: string;
  parentCommentId: string;
  user: CommunityUser | null;
  content: string;
  timestamp: number;
  likeCount: number;
  isLikedByCurrentUser: boolean;
};

export type FeedComment = {
  id: string;
  postId: string;
  user: CommunityUser | null;
  content: string;
  timestamp: number;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  replies: FeedReply[];
  isMoreThan2: boolean;
};

export type FeedNotification = {
  id: string;
  userId: string;
  name: string;
  type: string;
  sourceUserId: string;
  postId: string;
  commentId?: string | null;
  replyId?: string | null;
  contentPreview?: string | null;
  timestamp: number;
  read: boolean;
  profileUrl?: string | null;
  title?: string | null;
};

export type FeedTab = "all" | "mine" | "saved";

export const FEED_COLLECTIONS = {
  posts: "all-posts",
  users: "users",
  comments: "comments",
  notifications: "notifications",
  report: "report",
} as const;

export const FEED_PAGE_SIZE = 10;
