"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { SelectMenu } from "@/components/ui/select-menu";

interface DateSelectorProps {
  dates: string[];
  currentDate: string;
}

export function DateSelector({ dates, currentDate }: DateSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-500">数据日期</span>
      <SelectMenu
        value={currentDate}
        options={dates.map((item) => ({ value: item, label: item }))}
        placeholder="选择日期"
        triggerClassName="min-w-[11rem]"
        onValueChange={(date) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("date", date);
          router.push(`?${params.toString()}`);
        }}
      />
    </div>
  );
}
