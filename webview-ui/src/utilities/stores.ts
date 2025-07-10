import { writable } from "svelte/store"
import type MqttSubscription from "@common/interfaces/MqttSubscription"
import type { SubscriptionItem } from "../types"
import type MQTTMessage from "@common/interfaces/MqttMessage"

export const messages = writable([] as MQTTMessage[])
export const selectedMessage = writable<MQTTMessage | undefined>()
export const subscriptions = writable(new Map<string, SubscriptionItem>())
export const savedSubscriptions = writable(new Map<string, MqttSubscription>())
