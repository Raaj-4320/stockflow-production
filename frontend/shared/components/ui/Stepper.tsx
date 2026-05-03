import { Check } from "lucide-react";
import { clsx } from "clsx";

interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={clsx("flex items-center gap-0", className)}>
      {steps.map((step, index) => {
        const status =
          index < currentStep
            ? "complete"
            : index === currentStep
            ? "current"
            : "upcoming";

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={clsx(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border transition-all",
                  status === "complete" && "bg-text border-text text-bg",
                  status === "current" &&
                    "bg-text border-text text-bg shadow-sm",
                  status === "upcoming" &&
                    "bg-[var(--surface)] border-subtle text-muted"
                )}
                aria-current={status === "current" ? "step" : undefined}
              >
                {status === "complete" ? (
                  <Check size={13} strokeWidth={2.5} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={clsx(
                  "text-xs font-medium whitespace-nowrap leading-none hidden sm:block",
                  status === "current" && "text-text",
                  status === "complete" && "text-secondary",
                  status === "upcoming" && "text-muted"
                )}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={clsx(
                  "flex-1 h-px mx-2 transition-colors",
                  index < currentStep ? "bg-text" : "bg-[var(--border)]"
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
