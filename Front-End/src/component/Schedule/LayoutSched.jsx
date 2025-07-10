
import SchedTable from "./SchedTable";

function LayoutSchedule() {
  return (
    <div className="flex flex-col gap-6 p-6"> {/* Changed from flex-row to flex-col */}

      {/* Table Section */}
      <div className="w-full">
        <SchedTable />
      </div>
    </div>
  );
}

export default LayoutSchedule;