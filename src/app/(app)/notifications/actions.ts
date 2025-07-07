'use server';

import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, getDocs, type Timestamp } from 'firebase/firestore';
import { formatTimestamp } from '@/lib/utils';

export type NotificationType = {
  id: string;
  type: 'like' | 'comment' | 'follow';
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  postId?: string;
  postContentSnippet?: string;
  createdAt: Timestamp;
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
      const createdAt = (data.createdAt as Timestamp)?.toDate();
      return {
        id: doc.id,
        ...data,
        formattedTimestamp: createdAt ? formatTimestamp(createdAt) : 'now',
      } as NotificationType;
    });
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}
