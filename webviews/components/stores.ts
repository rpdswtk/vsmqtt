import { writable } from 'svelte/store';
import type { MqttSubscription } from '../../src/models/MqttSubscription';
import type { MQTTMessage, SubscriptionItem } from './types';

export const messages = writable(new Array<MQTTMessage>());
export let selectedMessage = writable({} as MQTTMessage | undefined);
export const subscriptions = writable(new Map<string, SubscriptionItem>());
export const savedSubscriptions = writable(new Map<string, MqttSubscription>());