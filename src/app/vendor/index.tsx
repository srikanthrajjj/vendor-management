import { useEffect, useRef } from "react";
import Dashboard from "./Dashboard";
import OpportunityList from "./OpportunityList";
import OpportunityDetail from "./OpportunityDetail";
import MyApplications from "./MyApplications";
import Notifications from "./Notifications";
import Contracts from "./Contracts";
import { oppById } from "./store";
import { Card, Empty, Nav, PageHeader } from "./ui";

export type { Nav };

export default function VendorModule({ section, oppId, tab, go }: { section: string; oppId: string | null; tab: string; go: Nav }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { (ref.current?.closest("main") as HTMLElement | null)?.scrollTo({ top: 0 }); }, [section, oppId]);
  const o = oppById(oppId);
  let body;
  if (section === "dashboard") body = <Dashboard go={go} />;
  else if (section === "opportunities") body = o ? <OpportunityDetail o={o} tab={tab} go={go} /> : <OpportunityList go={go} />;
  else if (section === "applications") body = <MyApplications go={go} />;
  else if (section === "notifications") body = <Notifications go={go} />;
  else if (section === "contracts") body = <Contracts />;
  else body = (
    <>
      <PageHeader title={section === "invoices" ? "My Invoices" : "My Cases"} sub="Not part of this prototype" />
      <div className="p-6"><Card><Empty title="Coming next">This section is not modelled in this prototype.</Empty></Card></div>
    </>
  );
  return <div ref={ref}>{body}</div>;
}
