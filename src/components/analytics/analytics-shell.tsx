import type { ReactNode } from "react";

type AnalyticsShellProps = {
  map: ReactNode;
  summary?: ReactNode;
  secondaryLeft: ReactNode;
  secondaryRight: ReactNode;
  tertiaryLeft?: ReactNode;
  tertiaryRight?: ReactNode;
};

export function AnalyticsShell(props: AnalyticsShellProps) {
  return (
    <div className="mt-8 space-y-6">
      {props.summary ? (
        <section className="grid gap-6 xl:grid-cols-[1.7fr_0.7fr]">
          {props.map}
          {props.summary}
        </section>
      ) : (
        <section>{props.map}</section>
      )}
      <section className="grid gap-6 xl:grid-cols-2">
        {props.secondaryLeft}
        {props.secondaryRight}
      </section>
      {props.tertiaryLeft || props.tertiaryRight ? (
        <section className="space-y-6">
          {props.tertiaryLeft}
          {props.tertiaryRight}
        </section>
      ) : null}
    </div>
  );
}
