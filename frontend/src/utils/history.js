import { db } from "../firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  limit as fbLimit,
  startAfter
} from "firebase/firestore";

// ✅ SAVE history inside users/<uid>/history
export async function saveHistoryItem(uid, item) {
  const docRef = await addDoc(
    collection(db, "users", uid, "history"),
    {
      ...item,
      created_at: serverTimestamp(),
    }
  );

  return docRef;
}

// ✅ LOAD user history safely
export const getUserHistory = async (userId, options = {}) => {
  const { limit = 50, startAfterDoc = null } = options;

  if (!userId) throw new Error("getUserHistory: valid userId required");

  const userHistoryRef = collection(db, "users", userId, "history");

  try {
    const constraints = [
      orderBy("created_at", "desc"),
      fbLimit(limit)
    ];

    if (startAfterDoc) constraints.push(startAfter(startAfterDoc));

    const q = query(userHistoryRef, ...constraints);
    const snap = await getDocs(q);

    const items = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    const lastVisible =
      snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

    return { items, nextCursor: lastVisible };

  } catch (err) {
    console.warn("Fallback mode:", err);

    const q = query(userHistoryRef, fbLimit(limit));
    const snap = await getDocs(q);

    const items = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    const sorted = items.sort(
      (a, b) => (b.created_at || 0) - (a.created_at || 0)
    );

    return { items: sorted, nextCursor: null };
  }
};
