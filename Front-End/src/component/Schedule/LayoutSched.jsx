
import SchedTable from "./SchedTable";

function LayoutSchedule() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-6 xs:p-1 2xs:p-1"> {/* Changed from flex-row to flex-col */}
      <div className="w-full">
        <SchedTable />
      </div>
    </div>
  );
}

export default LayoutSchedule;