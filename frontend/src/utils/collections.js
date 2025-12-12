import { db } from "../firebase";
import {
  addDoc,
  setDoc,
  doc,
  getDocs,
  collection,
  serverTimestamp
} from "firebase/firestore";

/* -------------------------------
   1) CREATE A NEW USER COLLECTION
-------------------------------- */
export const createUserCollection = async (userId, collectionName) => {
  const colRef = doc(
    db,
    "savedCollections",
    userId,
    "collections",
    collectionName
  );

  await setDoc(colRef, {
    name: collectionName,
    created_at: serverTimestamp(),
  });

  // ✔ important: return the COLLECTION ID
  return { id: collectionName, name: collectionName };
};

/* -----------------------------------
   2) SAVE REQUEST INTO A COLLECTION
------------------------------------ */
export const saveCollectionItem = async (collectionId, item, userId) => {
  const itemsRef = collection(
    db,
    "savedCollections",
    userId,
    "collections",
    collectionId,
    "items"
  );

  const docRef = await addDoc(itemsRef, {
    ...item,
    saved_at: serverTimestamp(),
  });

  return docRef.id;
};

/* --------------------------------------
   3) LOAD ALL ITEMS INSIDE ONE COLLECTION
---------------------------------------- */
export const loadCollectionItems = async (userId, collectionId) => {
  const itemsRef = collection(
    db,
    "savedCollections",
    userId,
    "collections",
    collectionId,
    "items"
  );

  const snap = await getDocs(itemsRef);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/* ----------------------------------------
   4) LOAD ALL USER COLLECTIONS + THEIR ITEMS
----------------------------------------- */
export const loadUserCollections = async (userId) => {
  const collectionsRef = collection(
    db,
    "savedCollections",
    userId,
    "collections"
  );

  const snap = await getDocs(collectionsRef);
  const collectionsList = [];

  for (const col of snap.docs) {
    const colData = col.data();
    const colId = col.id;

    // Load items inside collection
    const items = await loadCollectionItems(userId, colId);

    collectionsList.push({
      id: colId,
      name: colData.name,
      items,
    });
  }

  return collectionsList;
};
