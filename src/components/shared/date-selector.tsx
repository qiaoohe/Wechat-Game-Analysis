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
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
      <span className="shrink-0 text-xs whitespace-nowrap text-slate-500 sm:text-sm">
        数据日期
      </span>
      <SelectMenu
        value={currentDate}
        options={dates.map((item) => ({ value: item, label: item }))}
        placeholder="选择日期"
        triggerClassName="w-full sm:min-w-[11rem] sm:w-auto"
        onValueChange={(date) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("date", date);
          router.push(`?${params.toString()}`);
        }}
      />
    </div>
  );
}
