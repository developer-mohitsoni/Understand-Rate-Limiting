import { getRandomQuote } from "@/fetch/quoteFetch";
import { NextResponse } from "next/server";

export const GET = async () => {
  const quote = await getRandomQuote();

  console.log(quote);

  return NextResponse.json({ quote });
};
