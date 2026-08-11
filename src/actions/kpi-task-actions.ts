

"use server";

import { createKpiTask as createKpiTaskFn } from "@/orm/create-kpi-task";
import { getKpiTasks as getKpiTasksFn } from "@/orm/get-kpi-tasks";

export const createKpiTask = createKpiTaskFn;
export const getKpiTasks = getKpiTasksFn;