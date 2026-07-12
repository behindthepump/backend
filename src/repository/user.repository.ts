import type { DocumentData } from "firebase-admin/firestore";
import { db } from "../config/firebase.js";
import type { User } from "../domain/types.js";

function toUser(uid: string, data: DocumentData): User {
  return {
    id: uid,
    email: data.email ?? "",
    name: data.name ?? "",
    age: data.age ?? 0,
    gender: data.gender ?? "",
    height: data.height ?? 0,
    starting_weight: data.starting_weight ?? 0,
    target_weight: data.target_weight ?? 0,
    bmr: data.bmr ?? 0,
    program_start_date: data.program_start_date ?? "",
    // Docs created before frequency existed default to the 3-day split.
    workout_frequency: data.workout_frequency === 2 ? 2 : 3,
    // Docs created before self-signup existed are active clients.
    status: data.status === "pending" || data.status === "declined" ? data.status : "active",
    requested_at: data.requested_at
  };
}

export type ProfileFields = Pick<
  User,
  "name" | "age" | "gender" | "height" | "starting_weight" | "target_weight" | "bmr" | "workout_frequency"
>;

export class UserRepository {
  private col = db.collection("users");

  async getDoc(uid: string): Promise<DocumentData | null> {
    const snap = await this.col.doc(uid).get();
    return snap.exists ? snap.data()! : null;
  }

  // One page of active clients ordered by name, optionally filtered by a
  // name prefix. Cursor is the last doc id of the previous page. Requires
  // the (role, status, name_lower) composite index (firestore.indexes.json).
  async listActiveClientsPage(opts: {
    search: string;
    cursor: string | null;
    limit: number;
  }): Promise<{ users: User[]; nextCursor: string | null }> {
    let query = this.col
      .where("role", "==", "client")
      .where("status", "==", "active")
      .orderBy("name_lower");

    const search = opts.search.trim().toLowerCase();
    if (search) {
      query = query.startAt(search).endAt(`${search}`);
    }
    if (opts.cursor) {
      const cursorSnap = await this.col.doc(opts.cursor).get();
      if (cursorSnap.exists) query = query.startAfter(cursorSnap);
    }

    // Fetch one extra row to know whether another page exists.
    const snap = await query.limit(opts.limit + 1).get();
    const docs = snap.docs.slice(0, opts.limit);
    return {
      users: docs.map((d) => toUser(d.id, d.data())),
      nextCursor: snap.docs.length > opts.limit ? docs[docs.length - 1]!.id : null
    };
  }

  // Signup requests: pending + declined, oldest first. Small enough to stay
  // unpaginated (equality-only query - no composite index needed).
  async listRequests(): Promise<User[]> {
    const snap = await this.col
      .where("role", "==", "client")
      .where("status", "in", ["pending", "declined"])
      .get();
    return snap.docs
      .map((d) => toUser(d.id, d.data()))
      .sort((a, b) => (a.requested_at ?? "").localeCompare(b.requested_at ?? ""));
  }

  async getClient(uid: string): Promise<User | null> {
    const data = await this.getDoc(uid);
    if (!data || data.role !== "client") return null;
    return toUser(uid, data);
  }

  // Self-signup: the client's own doc, awaiting coach approval. Program
  // start date and workout frequency are set at approval.
  async createPendingClient(
    uid: string,
    fields: Pick<
      User,
      "email" | "name" | "age" | "gender" | "height" | "starting_weight" | "target_weight" | "bmr"
    >
  ): Promise<void> {
    await this.col.doc(uid).set({
      role: "client",
      status: "pending",
      requested_at: new Date().toISOString(),
      email: fields.email,
      name: fields.name,
      name_lower: fields.name.toLowerCase(), // for roster prefix search
      age: fields.age,
      gender: fields.gender,
      height: fields.height,
      starting_weight: fields.starting_weight,
      target_weight: fields.target_weight,
      bmr: fields.bmr,
      program_start_date: ""
    });
  }

  async activate(uid: string, programStartDate: string, workoutFrequency: 2 | 3): Promise<void> {
    await this.col.doc(uid).update({
      status: "active",
      program_start_date: programStartDate,
      workout_frequency: workoutFrequency
    });
  }

  async setDeclined(uid: string): Promise<void> {
    await this.col.doc(uid).update({ status: "declined" });
  }

  async updateProfile(uid: string, fields: ProfileFields): Promise<void> {
    await this.col.doc(uid).update({ ...fields, name_lower: fields.name.toLowerCase() });
  }

  async deleteDoc(uid: string): Promise<void> {
    await this.col.doc(uid).delete();
  }
}
