import DocTable from "./DoctorsTable"; // Siguraduhin na ang path na ito ay tama base sa iyong file structure
import CalendarGuide from "../Schedule/CalendarGuide"; // Siguraduhin na ang path na ito ay tama base sa iyong file structure

function DoctorLayout() {
  return (
    <div className="flex flex-col gap-6 p-6">

      <div className="w-full flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-96">
          <CalendarGuide/>
        </div>
        <div className="w-full md:flex-1">
          <DocTable />
        </div>
      </div>
    </div>
  );
}

export default DoctorLayout;
