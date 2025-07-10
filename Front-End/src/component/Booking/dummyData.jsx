// dummyData.js

export const dummyData = {
    // AuthContext Dummy Data
    AuthContext: {
        role: "clinicStaff", // Can be 'clinicStaff', 'patient', 'admin'
        zone: "Makati Clinic", // Example clinic location/zone
    },

    // Calendardata Dummy Data (originally from VaccineRecordDisplayContext)
    calendardataResponse: {
        "status": "Success",
        "data": [
            {
                "_id": "68498076591c4d0e2edb9b68",
                "date": "2025-06-04T00:00:00.000Z", // Past date
                "day": "Wednesday",
                "status": "Re-Assigned",
                "isActive": true,
                "createdAt": "2025-06-11T13:11:18.806Z",
                "updatedAt": "2025-06-11T16:51:07.494Z",
                "avatar": "uploads\\1748781389426-logo-removebg-preview.png",
                "doctorId": "683928e28d81ce708237f53c",
                "doctorName": "Dr. Juan Dela Cruz",
                "specialty": "Pediatric Dentistry",
                "timeSlots": [
                    {
                        "start": "09:10",
                        "end": "23:10",
                        "maxPatientsPerSlot": 12,
                        "reason": "Team meeting until 9:30 AM",
                        "_id": "68498076591c4d0e2edb9b69"
                    }
                ]
            },
            {
                "_id": "68498076591c4d0e2edb9b6b",
                "date": "2025-06-16T00:00:00.000Z", // Future date
                "day": "Monday",
                "status": "Approved",
                "isActive": true,
                "createdAt": "2025-06-11T13:11:18.816Z",
                "updatedAt": "2025-06-11T16:41:17.637Z",
                "avatar": "uploads\\1748781389426-logo-removebg-preview.png",
                "doctorId": "683928e28d81ce708237f53c",
                "doctorName": "Dr. Juan Dela Cruz",
                "specialty": "General Dentistry",
                "timeSlots": [
                    {
                        "start": "10:10",
                        "end": "23:10",
                        "maxPatientsPerSlot": 21,
                        "reason": "Regular clinic hours",
                        "_id": "6849807621c4d0e2edb9b6c"
                    }
                ]
            },
            {
                "_id": "68498076591c4d0e2edb9b6e",
                "date": "2025-06-12T00:00:00.000Z", // Today's date (June 12, 2025)
                "day": "Thursday",
                "status": "Approved",
                "isActive": true,
                "createdAt": "2025-06-11T13:11:18.823Z",
                "updatedAt": "2025-06-11T16:16:13.560Z",
                "avatar": "uploads\\1748781389426-logo-removebg-preview.png",
                "doctorId": "683928e28d81ce708237f53c",
                "doctorName": "Dr. Juan Dela Cruz",
                "specialty": "Orthodontics",
                "timeSlots": [
                    {
                        "start": "09:10",
                        "end": "12:00",
                        "maxPatientsPerSlot": 1,
                        "reason": "Morning patient schedule",
                        "_id": "68498076591c4d0e2edb9b6f"
                    },
                    {
                        "start": "13:00",
                        "end": "17:00",
                        "maxPatientsPerSlot": 3,
                        "reason": "Afternoon consultations",
                        "_id": "68498076591c4d0e2edb9b70"
                    }
                ]
            },
            {
                "_id": "68498d72038b8a673185c064",
                "date": "2025-06-20T00:00:00.000Z", // Future date
                "day": "Friday",
                "status": "Re-Assigned",
                "isActive": true,
                "createdAt": "2025-06-11T14:06:42.439Z",
                "updatedAt": "2025-06-11T16:48:43.137Z",
                "avatar": "uploads\\1749475223225-bipsu_new.png",
                "doctorId": "6846dba5512d57616f971150",
                "doctorName": "Dr. Mark Mista",
                "specialty": "Oral Surgery",
                "timeSlots": [
                    {
                        "start": "10:06",
                        "end": "18:06",
                        "maxPatientsPerSlot": 5,
                        "reason": "Scheduled surgeries",
                        "_id": "68498d72038b8a673185c065"
                    }
                ]
            },
            {
                "_id": "6849ab89fa2377995bf02e23",
                "date": "2025-06-01T00:00:00.000Z", // Past date
                "day": "Sunday",
                "status": "Approved",
                "isActive": true,
                "createdAt": "2025-06-11T16:15:05.475Z",
                "updatedAt": "2025-06-11T16:41:22.339Z",
                "avatar": "uploads\\1748782266645-CamScanner 11-19-2024 14.53 (2).jpg",
                "doctorId": "683b46804a034939100ffcb4",
                "doctorName": "Dr. Elizabeth Amis",
                "specialty": "Periodontics",
                "timeSlots": [
                    {
                        "start": "01:14",
                        "end": "17:14",
                        "maxPatientsPerSlot": 4,
                        "reason": "Sunday clinic hours",
                        "_id": "6849ab89fa2377995bf02e24"
                    }
                ]
            },
            {
                "_id": "today-appointment-1",
                "date": "2025-06-12T00:00:00.000Z", 
                "day": "Thursday",
                "status": "Approved",
                "isActive": true,
                "createdAt": "2025-06-12T09:00:00.000Z",
                "updatedAt": "2025-06-12T09:00:00.000Z",
                "avatar": "uploads\\1748781389426-logo-removebg-preview.png",
                "doctorId": "doctor-today-id",
                "doctorName": "Dr. Sarah Lee",
                "specialty": "Cosmetic Dentistry",
                "timeSlots": [
                    {
                        "start": "09:30",
                        "end": "10:30",
                        "maxPatientsPerSlot": 2,
                        "reason": "Morning consultations for whitening",
                        "_id": "today-slot-1"
                    }
                ]
            },
            {
                "_id": "future-appointment-1",
                "date": "2025-06-18T00:00:00.000Z", // Future appointment
                "day": "Wednesday",
                "status": "Approved",
                "isActive": true,
                "createdAt": "2025-06-11T10:00:00.000Z",
                "updatedAt": "2025-06-11T10:00:00.000Z",
                "avatar": "uploads\\1748781389426-logo-removebg-preview.png",
                "doctorId": "doctor-future-id",
                "doctorName": "Dr. Ben Lim",
                "specialty": "Endodontics",
                "timeSlots": [
                    {
                        "start": "14:00",
                        "end": "16:00",
                        "maxPatientsPerSlot": 4,
                        "reason": "Root canal procedures",
                        "_id": "future-slot-1"
                    }
                ]
            }
        ]
    },

    // Dummy useIsMobile hook
    useIsMobile: () => {
        // Set this to true or false to test mobile/desktop view
        return false; // Set to true to simulate mobile, false for desktop
    }
};