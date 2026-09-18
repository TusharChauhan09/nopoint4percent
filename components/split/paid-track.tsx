type PaidTrackProps = {
  paid: number;
  total: number;
};

export function PaidTrack({ paid, total }: PaidTrackProps) {
  const width = total === 0 ? 0 : (paid / total) * 100;

  return (
    <div className="mt-5">
      <div className="h-[3px] w-full bg-ink/10">
        <div
          className="paid-track-fill h-full bg-paid transition-[width] duration-300 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-2 text-sm tabular-nums text-muted-foreground">
        {paid} of {total} paid
      </p>
    </div>
  );
}
