"use client";

import { Check } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface SelectMenuOption {
  value: string;
  label: string;
}

interface SelectMenuProps {
  value: string;
  options: SelectMenuOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  align?: "start" | "end";
}

export function SelectMenu({
  value,
  options,
  onValueChange,
  placeholder = "请选择",
  className,
  triggerClassName,
  align = "start",
}: SelectMenuProps) {
  const selected = options.find((item) => item.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(className, triggerClassName)}>
        {selected?.label ?? placeholder}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            selected={option.value === value}
            onSelect={() => onValueChange(option.value)}
          >
            <span className="flex-1">{option.label}</span>
            {option.value === value ? (
              <Check className="h-4 w-4 shrink-0 text-brand" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
