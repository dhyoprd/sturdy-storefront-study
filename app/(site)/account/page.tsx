import type { Metadata } from "next";
import AccountPanel from "@/components/pages/AccountPanel";

export const metadata: Metadata = {
  title: "Account | Stüssy",
};

export default function AccountPage() {
  return (
    <main id="main" className="document-page">
      <div className="document-page__inner document-page__inner--narrow">
        <h1 className="document-page__title">Account</h1>
        <AccountPanel />
      </div>
    </main>
  );
}
