import { History,ShieldCheck ,Pill,BookOpen,KeyRound , Banknote,Home, BriefcaseMedical,PackagePlus,CalendarDays , Stethoscope, ShoppingBag, UserCheck, UserPlus, Users, Key } from "lucide-react";


export const navbarLinks = [
    {
        title: "Dashboard",
        links: [
            {
                label: "Dashboard",
                icon: Home,
                path: "/dashboard",
            },{
                label: "Calendar",
                icon: CalendarDays,
                path: "/dashboard/booking",
            },
        ],
    },
    {
        title: "Patients",
        links: [
            {
                label: "Patients",
                icon: Users,
                path: "/dashboard/all-patients",
            },
            {
                label: "New Patients",
                icon: UserPlus,
                path: "/dashboard/new-patients",
            }
           
        ],
    },
        {
        title: "Staff",
        links: [
            {
                label: "Staff",
                icon: Users,
                path: "/dashboard/Staff",
            }

           
        ],
    }, {
        title: "Doctor",
        links: [
            {
                label: "Doctor",
             icon: BriefcaseMedical,
                path: "/dashboard/doctors",
            }

           
        ],
    },
    {
        title: "Management",
        links: [
            {
                label: "Dental History",
                icon: History,
            path: "/dashboard/dentalhistory",
            },
             ,{
                label: "Treatment",
                icon: UserPlus,
                path: "/dashboard/Treatment",
            },
            {
                label: "Appointments",
                icon: Stethoscope,
                path: "/dashboard/appointment",
            },

             {
                label: "Bills",
                icon: Banknote,
                path: "/dashboard/bill",
            },
            
            {
                label: "Schedule",
                icon: CalendarDays ,
                path: "/dashboard/Schedule",
            },{
                label: "Prescription",
                icon: Pill ,
                path: "/dashboard/prescription",
            },{
                label: "Insurance",
                icon: ShieldCheck ,
                path: "/dashboard/Insurance",
            }
            
            
          
        ],
    },
    {
        title: "Settings",
        links: [
               {
                label: "Change Password",
                icon: KeyRound ,
                path: "/dashboard/Change-Password",
            },
        ],
    },
];


