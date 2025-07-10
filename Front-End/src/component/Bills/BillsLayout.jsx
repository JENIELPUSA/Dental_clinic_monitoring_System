import React from "react";
import BillTable from "./BillTable";
import HistoryTable from "./HistoryTable";

function BillsLayout() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <BillTable />
      <HistoryTable />
    </div>
  );
}

export default BillsLayout;
