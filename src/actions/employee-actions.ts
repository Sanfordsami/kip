"use server";

import { createEmployee as createEmployeeFn } from "@/orm/create-employee";
import { setEmployeeStatus as setEmployeeStatusFn } from "@/orm/set-employee-status";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };


export const createEmployee = createEmployeeFn;
export const setEmployeeStatus = setEmployeeStatusFn;



