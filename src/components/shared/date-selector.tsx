"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Select } from "@/components/ui/input";

interface DateSelectorProps {
  dates: string[];
  currentDate: string;
}

export function DateSelector({ dates, currentDate }: DateSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="date" className="text-sm text-zinc-500">
        数据日期
      </label>
      <Select
        id="date"
        value={currentDate}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("date", event.target.value);
          router.push(`?${params.toString()}`);
        }}
      >
        {dates.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </Select>
    </div>
  );
}
