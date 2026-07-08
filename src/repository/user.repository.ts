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
    starting_weight: data.starting_weight ?? 0,
    target_weight: data.target_weight ?? 0,
    bmr: data.bmr ?? 0,
    program_start_date: data.program_start_date ?? ""
  };
}

export type ProfileFields = Pick<
  User,
  "name" | "age" | "gender" | "starting_weight" | "target_weight" | "bmr"
>;

export class UserRepository {
  private col = db.collection("users");

  async getDoc(uid: string): Promise<DocumentData | null> {
    const snap = await this.col.doc(uid).get();
    return snap.exists ? snap.data()! : null;
  }

  async listClients(): Promise<User[]> {
    const snap = await this.col.where("role", "==", "client").get();
    return snap.docs.map((d) => toUser(d.id, d.data()));
  }

  async getClient(uid: string): Promise<User | null> {
    const data = await this.getDoc(uid);
    if (!data || data.role !== "client") return null;
    return toUser(uid, data);
  }

  async createClient(uid: string, fields: Omit<User, "id">): Promise<void> {
    await this.col.doc(uid).set({
      role: "client",
      email: fields.email,
      name: fields.name,
      age: fields.age,
      gender: fields.gender,
      starting_weight: fields.starting_weight,
      target_weight: fields.target_weight,
      bmr: fields.bmr,
      program_start_date: fields.program_start_date,
      must_change_password: true
    });
  }

  async updateProfile(uid: string, fields: ProfileFields): Promise<void> {
    await this.col.doc(uid).update({ ...fields });
  }

  async clearMustChangePassword(uid: string): Promise<void> {
    await this.col.doc(uid).update({ must_change_password: false });
  }

  async deleteDoc(uid: string): Promise<void> {
    await this.col.doc(uid).delete();
  }
}
