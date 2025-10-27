import { useMemo } from 'react';

export const useProgressStats = (filteredAppointments, totalPending, totalConfirmed, totalCancelled) => {
    const progressStats = useMemo(() => {
        const totalAppointments = filteredAppointments.length;
        const completionRate = totalAppointments > 0 
            ? ((totalConfirmed + totalCancelled) / totalAppointments) * 100 
            : 0;
        
        const monthlyAppointments = filteredAppointments.filter(app => {
            const appDate = new Date(app.appointment_date);
            const currentDate = new Date();
            return appDate.getMonth() === currentDate.getMonth() && 
                   appDate.getFullYear() === currentDate.getFullYear();
        }).length;

        return {
            totalAppointments,
            completionRate: Math.round(completionRate),
            monthlyAppointments,
            pendingRate: totalAppointments > 0 ? Math.round((totalPending / totalAppointments) * 100) : 0,
            confirmedRate: totalAppointments > 0 ? Math.round((totalConfirmed / totalAppointments) * 100) : 0,
            cancelledRate: totalAppointments > 0 ? Math.round((totalCancelled / totalAppointments) * 100) : 0
        };
    }, [filteredAppointments, totalPending, totalConfirmed, totalCancelled]);

    return progressStats;
};