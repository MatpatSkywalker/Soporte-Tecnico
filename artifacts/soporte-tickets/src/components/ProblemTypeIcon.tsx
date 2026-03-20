import React from "react";
import { Cpu, MonitorSmartphone } from "lucide-react";
import { ProblemType } from "@workspace/api-client-react/src/generated/api.schemas";

interface ProblemTypeIconProps {
  type: ProblemType;
  className?: string;
}

export function ProblemTypeIcon({ type, className = "w-5 h-5" }: ProblemTypeIconProps) {
  if (type === "hardware") {
    return <Cpu className={className} />;
  }
  return <MonitorSmartphone className={className} />;
}
