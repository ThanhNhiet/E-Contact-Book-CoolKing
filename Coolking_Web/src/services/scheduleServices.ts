import axiosInstance from "../configs/axiosConf";

class ScheduleServices {
    // GET /api/schedules/by-user?currentDate=dd-mm-yyyy
    async getSchedulesByUser(currentDate: string) {
        const response = await axiosInstance.get("/schedules/by-user", {
            params: {
                currentDate
            }
        });
        return response.data;
    }
}

export const scheduleServices = new ScheduleServices();
export default scheduleServices;