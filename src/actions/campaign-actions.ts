
dd
"use server";

import { createCampaign as createCampaignFn } from "@/orm/create-campaign";
import { sendCampaign as sendCampaignFn } from "@/orm/send-campaign";
import { getCampaigns as getCampaignsFn } from "@/orm/get-campaigns";

export const createCampaign = createCampaignFn;
export const sendCampaign = sendCampaignFn;
export const getCampaigns = getCampaignsFn;