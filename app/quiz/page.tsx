'use client';
import dynamic from "next/dynamic";
const Quiz = dynamic(() => import("@/examples/QuizWithSelector"), { ssr: false });
export default function Page(){ return <Quiz/>; }


