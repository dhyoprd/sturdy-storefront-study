import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Size guide | Stüssy",
};

const conversions = [
  ["stüssy clothing size (alpha)", "XS", "S", "M", "L", "XL", "XXL"],
  ["stüssy clothing size (numeric)", "28", "29-30", "31-32", "33-34", "36", "38"],
  ["UK Size", "36", "38", "40", "42", "44", "46"],
  ["IT/FR/EU Size", "44", "46", "48", "50", "52", "54"],
  ["KR Size", "90", "95", "100", "105", "110", "115"],
  ["JP Size", "2", "3", "4", "5", "6", "7"],
];

const measurements = [
  ["stüssy clothing size (alpha)", "XS", "S", "M", "L", "XL", "XXL"],
  ["stüssy clothing size (numeric)", "28", "29-30", "31-32", "33-34", "36", "38"],
  ["Chest (IN)", "38-40\"", "42-44\"", "44-46\"", "46-48\"", "48-50\"", "52-54\""],
  ["Waist (IN)", "26-27\"", "28-29\"", "30-31\"", "32-34\"", "35-36\"", "37\""],
  ["Chest (CM)", "96-101", "106-111", "112-117", "117-122", "122-127", "132-137"],
  ["Waist (CM)", "66-68", "71-73", "76-78", "81-86", "88-91", "92-94"],
];

function SizeTable({ rows }: { rows: string[][] }) {
  return (
    <div className="size-table-wrap">
      <table className="size-table">
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) =>
                index === 0 ? <th key={index}>{cell}</th> : <td key={index}>{cell}</td>,
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SizeGuidePage() {
  return (
    <main id="main" className="document-page">
      <div className="document-page__inner">
        <h1 className="document-page__title">Size Guide</h1>
        <p className="document-copy">
          <em>
            Disclaimer: Size, fit and measurements may vary from one style to another.
            Please refer to the flat garment measurements provided on each product page.
          </em>
        </p>

        <section className="document-section">
          <h2 className="document-page__section-title">International Size Conversions</h2>
          <SizeTable rows={conversions} />
        </section>

        <section className="document-section">
          <h2 className="document-page__section-title">Body Measurements</h2>
          <SizeTable rows={measurements} />
        </section>
      </div>
    </main>
  );
}
