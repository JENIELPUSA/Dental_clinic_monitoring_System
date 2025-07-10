
import PatientTable from "./PatientTable";

function Layout() {
  return (
    <div className="flex flex-col gap-6 p-6"> {/* Changed from flex-row to flex-col */}

      {/* Table Section */}
      <div className="w-full">
        <PatientTable />
      </div>
    </div>
  );
}

export default Layout;