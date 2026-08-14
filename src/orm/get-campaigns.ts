"use server";

import { supabase } from "@/lib/supabase";

export async function getCampaigns() {
  const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("getCampaigns failed:", error);
    return [];
  }
  return data ?? [];
}