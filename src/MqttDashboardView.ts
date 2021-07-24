import { BaseMqttView } from "./BaseMqttView";

export class MqttDashboardView extends BaseMqttView {
    public static readonly viewType = "MqttDashboardPanel";

    protected async handleMessages(data: any) {
        
    }
}