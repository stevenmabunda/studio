
'use server';

import { db } from '@/lib/firebase/config';
import {
    doc,
    getDoc,
    setDoc,
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from 'firebase/firestore';
import { getUserProfile, type ProfileData } from '@/app/(app)/profile/actions';

export type Message = {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
};

export type Conversation = {
    id: string;
    participantIds: string[];
    lastMessage: {
        text: string;
        timestamp: Date;
        senderId: string;
    };
    otherUser: ProfileData;
    isRead: boolean;
};

export type ConversationDetails = {
    id: string;
    participants: ProfileData[];
};

export async function getOrCreateConversation(currentUserId: string, otherUserId: string): Promise<string> {
    if (!db) throw new Error("Firestore not initialized");

    // Create a consistent ID for the conversation regardless of who initiates it.
    const conversationId = [currentUserId, otherUserId].sort().join('_');
    const conversationRef = doc(db, 'conversations', conversationId);

    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) {
        const currentUserProfile = await getUserProfile(currentUserId);
        const otherUserProfile = await getUserProfile(otherUserId);

        if (!currentUserProfile || !otherUserProfile) {
            throw new Error("Could not find user profiles to start conversation.");
        }
        
        await setDoc(conversationRef, {
            participantIds: [currentUserId, otherUserId],
            participants: {
                [currentUserId]: {
                    displayName: currentUserProfile.displayName,
                    photoURL: currentUserProfile.photoURL,
                    handle: currentUserProfile.handle
                },
                [otherUserId]: {
                    displayName: otherUserProfile.displayName,
                    photoURL: otherUserProfile.photoURL,
                    handle: otherUserProfile.handle
                }
            },
            createdAt: serverTimestamp(),
            lastMessage: null,
        });
    }

    return conversationId;
}

export async function sendMessage(conversationId: string, senderId: string, text: string): Promise<void> {
    if (!db) throw new Error("Firestore not initialized");

    const conversationRef = doc(db, 'conversations', conversationId);
    const messagesRef = collection(conversationRef, 'messages');

    const messageData = {
        senderId,
        text,
        timestamp: serverTimestamp(),
    };
    
    await addDoc(messagesRef, messageData);
    
    // Update the last message on the conversation for preview
    await setDoc(conversationRef, { 
        lastMessage: messageData,
        isReadBy: [senderId] // Mark as read for the sender
    }, { merge: true });
}

export async function getConversations(userId: string): Promise<Conversation[]> {
    if (!db) return [];

    const conversationsQuery = query(
        collection(db, 'conversations'),
        where('participantIds', 'array-contains', userId),
        orderBy('lastMessage.timestamp', 'desc')
    );

    const snapshot = await getDocs(conversationsQuery);

    if (snapshot.empty) {
        return [];
    }
    
    const conversations = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const otherUserId = data.participantIds.find((id: string) => id !== userId);
            
            if (!otherUserId) return null;

            const otherUserData = data.participants?.[otherUserId];

            if (!otherUserData || !data.lastMessage) return null;
            
            const otherUser: ProfileData = {
                uid: otherUserId,
                displayName: otherUserData.displayName || 'User',
                handle: otherUserData.handle || 'user',
                photoURL: otherUserData.photoURL || 'https://placehold.co/40x40.png',
                // Fill with placeholder data as we don't need full profile here
                bannerUrl: '', bio: '', country: '', favouriteClub: '', joined: '', followersCount: 0, followingCount: 0, location: ''
            };

            const isRead = data.isReadBy?.includes(userId) || false;

            return {
                id: docSnap.id,
                participantIds: data.participantIds,
                lastMessage: {
                    ...data.lastMessage,
                    timestamp: data.lastMessage.timestamp.toDate(),
                },
                otherUser,
                isRead,
            } as Conversation;
        })
    );
    
    return conversations.filter((c): c is Conversation => c !== null);
}

export async function getConversationDetails(conversationId: string): Promise<ConversationDetails | null> {
    if (!db) return null;

    const conversationRef = doc(db, 'conversations', conversationId);
    const snap = await getDoc(conversationRef);

    if (!snap.exists()) {
        return null;
    }

    const data = snap.data();
    const participantIds = data.participantIds as string[];

    const participants = await Promise.all(
        participantIds.map(id => getUserProfile(id))
    );

    return {
        id: snap.id,
        participants: participants.filter((p): p is ProfileData => p !== null),
    };
}
