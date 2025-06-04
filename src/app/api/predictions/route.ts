import { db } from '@/lib/firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// GET all predictions
export async function GET() {
  const snapshot = await getDocs(collection(db, 'predictions'));
  const predictions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(predictions);
}

// POST a new prediction
export async function POST(req: Request) {
  const data = await req.json();
  const docRef = await addDoc(collection(db, 'predictions'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return NextResponse.json({ id: docRef.id });
}

// PATCH to update a prediction
export async function PATCH(req: Request) {
  const { id, ...updateData } = await req.json();
  const docRef = doc(db, 'predictions', id);
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
  return NextResponse.json({ success: true });
}

// DELETE a prediction
export async function DELETE(req: Request) {
  const { id } = await req.json();
  const docRef = doc(db, 'predictions', id);
  await deleteDoc(docRef);
  return NextResponse.json({ success: true });
}