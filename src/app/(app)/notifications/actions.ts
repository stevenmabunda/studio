'use server';

import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, getDocs, type Timestamp, where } from 'firebase/firestore';
import { formatTimestamp } from '@/lib/utils';

export type NotificationType = {
  id: string;
  type: 'like' | 'comment' | 'follow';
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  postId?: string;
  postContentSnippet?: string;
  createdAt: Date; // Changed to Date to be serializable
  read: boolean;
  formattedTimestamp: string;
};

export async function getNotifications(userId: string): Promise<NotificationType[]> {
  if (!db || !userId) {
    return [];
  }

  const notificationsRef = collection(db, 'users', userId, 'notifications');
  const q = query(notificationsRef, orderBy('createdAt', 'desc'));

  try {
    const querySnapshot = await getDocs(q);
    const notifications = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = (data.createdAt as Timestamp)?.toDate() || new Date();
      return {
        id: doc.id,
        type: data.type,
        fromUserId: data.fromUserId,
        fromUserName: data.fromUserName,
        fromUserAvatar: data.fromUserAvatar,
        postId: data.postId,
        postContentSnippet: data.postContentSnippet,
        read: data.read,
        createdAt: createdAt,
        formattedTimestamp: formatTimestamp(createdAt),
      } as NotificationType;
    });
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  if (!db || !userId) {
    return 0;
  }

  const notificationsRef = collection(db, 'users', userId, 'notifications');
  const q = query(notificationsRef, where('read', '==', false));

  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    return 0;
  }
}
