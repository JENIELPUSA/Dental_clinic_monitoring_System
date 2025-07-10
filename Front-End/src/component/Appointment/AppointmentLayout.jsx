import AppointmentTable from "./appointmentTable";

function AppointmentLayout() {
  return (
    <div className="flex flex-col gap-6 p-6"> {/* Changed from flex-row to flex-col */}

      {/* Table Section */}
      <div className="w-full">
        <AppointmentTable />
      </div>
    </div>
  );
}

export default AppointmentLayout;