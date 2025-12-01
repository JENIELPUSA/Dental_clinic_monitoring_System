import { History,ShieldCheck ,Pill,BookOpen,KeyRound , Banknote,Home, Logs ,BriefcaseMedical,CalendarDays , Stethoscope, ShoppingBag, UserCheck, UserPlus, Users, Key } from "lucide-react";


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
        title: "Manage Accounts",
        links: [
            {
                label: "Accounts",
                icon: Users,
                path: "/dashboard/Accounts",
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
                label: "Payments",
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
            },
            {
                label: "Inventory",
                icon: BriefcaseMedical ,
                path: "/dashboard/Inventory",
            },
             {
                label: "Activity Logs",
                icon: Logs  ,
                path: "/dashboard/Logs",
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


