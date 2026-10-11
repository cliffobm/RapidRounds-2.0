'use client';
import dynamic from "next/dynamic";
const Review = dynamic(() => import("@/examples/ReviewBookmarkedFlagged"), { ssr: false });
export default function Page(){ return <Review/>; }


