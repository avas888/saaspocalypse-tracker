import { useState } from "react";
import { REGION_ORDER } from "../sectors.js";
import { useLiveSectors } from "../hooks/useLiveSectors.js";
import MainLayout from "../templates/MainLayout.jsx";
import {
  SectorList,
  SectorDetail,
  Tracker,
  IndexesTab,
  CompaniesList,
  PrivateCompaniesList,
  SectorNewsSection,
  AnalysisSection,
  FrameworkSection,
} from "../organisms/index.js";

const severity_order = { catastrophic: 0, severe: 1, moderate: 2, low: 3 };

export default function App() {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("tracker");
  const { sectors, loading, dataAsOf } = useLiveSectors();

  const sorted = [...sectors].sort((a, b) => severity_order[a.severity] - severity_order[b.severity] || a.avgDrop - b.avgDrop);
  const sector = selected ? sectors.find((s) => s.id === selected) : null;

  const sectorShortName = (id) => (id === "accounting" ? "Accounting" : id === "payroll" ? "Payroll" : null);
  const allCos = sectors.flatMap((s) =>
    s.companies
      .filter((c) => c.drop !== null)
      .map((c) => ({
        ...c,
        sectorName: s.name,
        sectorColor: s.color,
        sectorIcon: s.icon,
        sectorShortName: sectorShortName(s.id) ?? s.name.split(" ")[0],
      }))
  ).sort((a, b) => a.drop - b.drop);

  const publicCos = allCos.filter((c) => c.status === "public");
  const privateCos = sectors.flatMap((s) =>
    s.companies.filter((c) => c.status === "private").map((c) => ({
      ...c,
      sectorName: s.name,
      sectorIcon: s.icon,
      sectorShortName: sectorShortName(s.id) ?? s.name.split(" ")[0],
      sectorColor: s.color,
    }))
  );

  function handleTabChange(tabId) {
    setTab(tabId);
    setSelected(null);
  }

  let content = null;
  if (tab === "tracker") {
    content = <Tracker />;
  } else if (tab === "indexes") {
    content = <IndexesTab />;
  } else if (tab === "sectors" && !sector) {
    content = <SectorList onSelectSector={(id) => setSelected(id)} sorted={sorted} />;
  } else if (tab === "sectors" && sector) {
    content = <SectorDetail sector={sector} onBack={() => setSelected(null)} />;
  } else if (tab === "sector-news") {
    content = <SectorNewsSection />;
  } else if (tab === "companies") {
    content = <CompaniesList publicCos={publicCos} regionOrder={REGION_ORDER} />;
  } else if (tab === "private") {
    content = <PrivateCompaniesList privateCos={privateCos} regionOrder={REGION_ORDER} />;
  } else if (tab === "analysis") {
    content = <AnalysisSection />;
  } else if (tab === "framework") {
    content = <FrameworkSection />;
  }

  return (
    <MainLayout tab={tab} onTabChange={handleTabChange} dataAsOf={dataAsOf} loading={loading}>
      {content}
    </MainLayout>
  );
}
