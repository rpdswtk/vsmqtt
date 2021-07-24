import { BaseMqttView } from "./BaseMqttView";
import { removeSavedSubscription, saveMessageLog, saveSubscription } from "./helpers";

export class MqttConnectionView extends BaseMqttView {
    public static readonly viewType = "MqttConnectionPanel";

    protected async handleMessages(data: any) {
        switch (data.type) {
            case "saveSubscription": {
                if (!data.value) {
                    return;
                }
                console.log(`Saving subscription: ${JSON.stringify(data.value.subscription)}`);
                await saveSubscription(data.value.profileName, data.value.subscription);
                break;
            }
            case "removeSavedSubscription": {
                if (!data.value) {
                    return;
                }
                console.log(`Removing saved subscription: ${JSON.stringify(data.value.subscription)}`);
                await removeSavedSubscription(data.value.profileName, data.value.subscription);
                break;
            }
            case "exportMessages": {
                if (!data.value) {
                    return;
                }
                console.log(`Saving message log for topic: ${data.value.topic}`);
                saveMessageLog(data.value.messages);
                break;
            }
        }
    }
}