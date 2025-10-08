import axiosInstance from '../configs/axiosConf';

class AlertService {
   /**
    * Admin
    */
   // GET /api/alerts?page=1&pagesize=10
   async getAlerts(page: number, pageSize: number) {
      const response = await axiosInstance.get(`/alerts`, {
         params: {
            page: page,
            pagesize: pageSize
         }
      });
      return response.data;
   }

   // GET /api/alerts/search?keyword=<keyword>&page=1&pageSize=10
   async searchAlerts(keyword: string, page: number, pageSize: number) {
      const response = await axiosInstance.get(`/alerts/search`, {
         params: {
            keyword,
            page,
            pagesize: pageSize
         }
      });
      return response.data;
   }

   // POST /api/alerts/send-all
    async sendAlertToAll(header: string, body: string) {
      const response = await axiosInstance.post(`/alerts/send-all`, {
         header,
         body
      });
      return response.data;
   }

   // DELETE /api/alerts
   async deleteAlert(alertID: string, createdAt: string, senderID: string) {
      const response = await axiosInstance.delete(`/alerts`, {
         data: {
            alertID,
            createdAt,
            senderID
         }
      });
      return response.data;
   }

   // PUT /api/alerts/:alertId
   async updateAlert(alertId: string, header?: string, body?: string) {
      const response = await axiosInstance.put(`/alerts/${alertId}`, {
         header,
         body
      });
      return response.data;
   }
   
   /**  
    *  Lecturer
    */
   // GET /api/alerts/my-alerts?page=1&pageSize=10
   async getMyAlerts(page: number, pageSize: number) {
      const response = await axiosInstance.get(`/alerts/my-alerts`, {
         params: {
            page: page,
            pagesize: pageSize
         }
      });
      return response.data;
   }

   // PUT /api/alerts/<alertId>/read
   async markAlertAsRead(alertId: string) {
      const response = await axiosInstance.put(`/alerts/${alertId}/read`);
      return response.data;
   }
}
// Export singleton instance
export const alertService = new AlertService();
export default alertService;