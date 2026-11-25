import sizeCharts from "@/data/size-charts.json";

type SizeChartEntry = {
  note?: string;
  html?: string;
};

const charts = sizeCharts as Record<string, SizeChartEntry>;

export default function ProductSizeGuide({ handle }: { handle: string }) {
  const entry = charts[handle];
  const notes = entry?.note
    ? entry.note
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
    : [];
  const chartHtml = entry?.html ?? "";

  return (
    <>
      {notes.map((note, index) => (
        <p key={`${index}-${note}`} className="pdp-size-guide__note">
          {note}
        </p>
      ))}
      {chartHtml ? (
        <div className="pdp-size-chart" dangerouslySetInnerHTML={{ __html: chartHtml }} />
      ) : (
        <p className="pdp-size-guide__note">Size guide is not available for this item.</p>
      )}
    </>
  );
}
