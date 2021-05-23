import { writable } from 'svelte/store';
import type { MQTTMessage, SubscriptionItem } from './types';

export const messages = writable(new Array<MQTTMessage>());
export let selectedMessage = writable({} as MQTTMessage | undefined);
export const subscriptions = writable(new Array<SubscriptionItem>());