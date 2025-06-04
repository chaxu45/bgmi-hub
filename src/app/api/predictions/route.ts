
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import fs from 'fs';
// import path from 'path';
// import { StoredPredictionQuestionSchema, type StoredPredictionQuestion } from '@/types';

// const predictionFilePath = path.join(process.cwd(), 'src', 'data', 'json-db', 'prediction.json');

// async function readPrediction(): Promise<StoredPredictionQuestion | null> {
//   try {
//     if (!fs.existsSync(predictionFilePath)) {
//       await writePrediction(null); // Create file with null if it doesn't exist
//       return null;
//     }
//     const jsonData = await fs.promises.readFile(predictionFilePath, 'utf-8');
//     if (jsonData.trim() === 'null' || jsonData.trim() === '') {
//       return null;
//     }
//     return StoredPredictionQuestionSchema.parse(JSON.parse(jsonData));
//   } catch (error) {
//     console.error('Error reading prediction file:', error);
//     // If parsing fails or other read errors, assume no valid prediction
//     await writePrediction(null); // Reset to null in case of corrupted data
//     return null;
//   }
// }

// async function writePrediction(data: StoredPredictionQuestion | null): Promise<void> {
//   try {
//     const dir = path.dirname(predictionFilePath);
//     if (!fs.existsSync(dir)) {
//         await fs.promises.mkdir(dir, { recursive: true });
//     }
//     const jsonData = JSON.stringify(data, null, 2);
//     await fs.promises.writeFile(predictionFilePath, jsonData, 'utf-8');
//   } catch (error) {
//     console.error('Error writing prediction file:', error);
//     throw new Error('Could not write prediction data.');
//   }
// }

// export async function GET() {
//   try {
//     const prediction = await readPrediction();
//     return NextResponse.json(prediction);
//   } catch (error) {
//     console.error("Error in GET /api/predictions:", error);
//     return NextResponse.json({ message: 'Error fetching prediction', error: (error as Error).message }, { status: 500 });
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const requestBody = await request.json();
//     const validationResult = StoredPredictionQuestionSchema.safeParse(requestBody);

//     if (!validationResult.success) {
//       return NextResponse.json({ message: 'Invalid prediction data', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
//     }

//     const newPredictionData = validationResult.data;
//     await writePrediction(newPredictionData);

//     return NextResponse.json(newPredictionData, { status: 201 });
//   } catch (error) {
//     console.error("Error in POST /api/predictions:", error);
//     const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
//     return NextResponse.json({ message: 'Error setting prediction', error: errorMessage }, { status: 500 });
//   }
// }

// export async function DELETE() {
//   try {
//     await writePrediction(null); // Set prediction to null
//     return NextResponse.json({ message: 'Prediction deleted successfully' }, { status: 200 });
//   } catch (error) {
//     console.error("Error in DELETE /api/predictions:", error);
//     const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
//     return NextResponse.json({ message: 'Error deleting prediction', error: errorMessage }, { status: 500 });
//   }
// }
// import { db } from '@/lib/firebase/config';
// import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
// import { NextResponse } from 'next/server';

// // GET all predictions
// export async function GET() {
//   const snapshot = await getDocs(collection(db, 'predictions'));
//   const predictions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//   return NextResponse.json(predictions);
// }

// // POST a new prediction
// export async function POST(req: Request) {
//   const data = await req.json();
//   const docRef = await addDoc(collection(db, 'predictions'), data);
//   return NextResponse.json({ id: docRef.id });
// }

// // PATCH to update a prediction (example)
// export async function PATCH(req: Request) {
//   const { id, ...updateData } = await req.json();
//   const docRef = doc(db, 'predictions', id);
//   await updateDoc(docRef, updateData);
//   return NextResponse.json({ success: true });
// }

// // DELETE a prediction (example)
// export async function DELETE(req: Request) {
//   const { id } = await req.json();
//   const docRef = doc(db, 'predictions', id);
//   await deleteDoc(docRef);
//   return NextResponse.json({ success: true });
// }
import { db } from '@/lib/firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define the prediction schema for validation
const PredictionSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  options: z.array(z.string()).min(2, "At least 2 options are required"),
  correctAnswer: z.string().optional(),
  isActive: z.boolean().default(true),
  expiresAt: z.string().datetime().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

type Prediction = z.infer<typeof PredictionSchema> & { id?: string };

// GET all active predictions
export async function GET() {
  try {
    const q = query(
      collection(db, 'predictions'),
      orderBy('createdAt', 'desc'),
      limit(10) // Limit to 10 most recent predictions
    );
    
    const snapshot = await getDocs(q);
    const predictions: Prediction[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json(
      { message: 'Error fetching predictions', error: (error as Error).message }, 
      { status: 500 }
    );
  }
}

// POST a new prediction
export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate input
    const validation = PredictionSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.error.format() },
        { status: 400 }
      );
    }

    // Add timestamps
    const predictionData = {
      ...validation.data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'predictions'), predictionData);
    
    return NextResponse.json(
      { id: docRef.id, ...predictionData },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating prediction:", error);
    return NextResponse.json(
      { message: 'Error creating prediction', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PATCH to update a prediction
export async function PATCH(req: Request) {
  try {
    const { id, ...updateData } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { message: 'Prediction ID is required' },
        { status: 400 }
      );
    }

    // Check if document exists
    const docRef = doc(db, 'predictions', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return NextResponse.json(
        { message: 'Prediction not found' },
        { status: 404 }
      );
    }

    // Validate update data
    const validation = PredictionSchema.partial().safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.error.format() },
        { status: 400 }
      );
    }

    // Add updatedAt timestamp
    const updateWithTimestamp = {
      ...validation.data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updateWithTimestamp);
    
    return NextResponse.json({
      id,
      ...updateWithTimestamp
    });
  } catch (error) {
    console.error("Error updating prediction:", error);
    return NextResponse.json(
      { message: 'Error updating prediction', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE a prediction
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { message: 'Prediction ID is required' },
        { status: 400 }
      );
    }

    const docRef = doc(db, 'predictions', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return NextResponse.json(
        { message: 'Prediction not found' },
        { status: 404 }
      );
    }

    await deleteDoc(docRef);
    
    return NextResponse.json(
      { message: 'Prediction deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting prediction:", error);
    return NextResponse.json(
      { message: 'Error deleting prediction', error: (error as Error).message },
      { status: 500 }
    );
  }
}