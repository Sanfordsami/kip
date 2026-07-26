"use server";

import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { kpiTaskSchema } from "@/lib/validations";
import type { ActionResult } from "./employee-actions"; // reuse the same result type