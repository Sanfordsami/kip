"use server";

import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";

export async function getActiveEmployees() {
  return db.query.employees.findMany({
    where: eq(schema.employees.status, "active"),
    with: { department: true },
    orderBy: asc(schema.employees.fullName),
  });
}

export async function getAllEmployees() {
  return db.query.employees.findMany({
    with: { department: true },
    orderBy: asc(schema.employees.fullName),
  });
}