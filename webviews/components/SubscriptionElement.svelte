<script lang="ts">
    import { ColorManager } from "./ColorManager";
    import type { SubscriptionItem } from "./types";
    import { subscriptions, savedSubscriptions } from './stores';
    import Icon from './Icon.svelte';

    export let subscription: SubscriptionItem;
    export let profileName: string;

    function unsubscribe(subscriptionItem: SubscriptionItem) {
        $subscriptions.delete(subscriptionItem.topic);
        $subscriptions = $subscriptions;

        vscode.postMessage({
            type: "unsubscribe",
            value: { topic: subscriptionItem.topic },
        });
    }
</script>

<div class="list-item">
    <div class="color-marker" style="background-color: {ColorManager.getColor(subscription.topic)};"></div>
    <div class="topic-label">Topic: </div>
    <div class="topic">{subscription.topic}</div>
    {#if !$savedSubscriptions.has(subscription.topic)}
        <div class="pin" title="pin" on:click={() => {
            vscode.postMessage({type: "saveSubscription",
                value: {
                    profileName: profileName,
                    subscription: {
                        topic: subscription.topic,
                        qos: subscription.qos
                    }
                    
                }
            });
            $savedSubscriptions.set(subscription.topic, subscription);
            $savedSubscriptions = $savedSubscriptions;
        }}>
            <Icon name="pin"></Icon>
        </div>
    {/if}
    
    {#if $savedSubscriptions.has(subscription.topic)}
        <div class="pin" title="unpin" on:click={() => {
           vscode.postMessage({type: "removeSavedSubscription",
                value: {
                    profileName: profileName,
                    subscription: {
                        topic: subscription.topic,
                        qos: subscription.qos
                    }
                }
            });
            $savedSubscriptions.delete(subscription.topic);
            $savedSubscriptions = $savedSubscriptions;
        }}>
        <Icon name="pinned"></Icon>
    </div>
    {/if}

    <div class="qos">QoS {subscription.qos}</div>
    <div class="msg-cnt">{subscription.messageCount}</div>
    <button class="unsub"
        on:click={() => {
            unsubscribe(subscription);
        }}>Unsubscribe</button>
</div>

<style>
     .list-item {
        display: grid;
        grid-template-rows: auto auto;
        grid-template-columns: 4px 4em auto 2em 7em;
        grid-template-areas: 
            "color-marker topic-label topic pin unsub"
            "color-marker qos . . message-count";
        background-color: var(--vscode-input-background);
        margin-bottom: 5px;
        margin-top: 5px;
    }

    .topic-label {
        grid-area: topic-label;
        margin: 5px;
    }

    .topic {
        grid-area: topic;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin: 5px;
    }

    .qos {
        grid-area: qos;
        margin: 2px 5px 5px 5px;
    }

    .unsub {
        grid-area: unsub;
    }

    .color-marker {
        grid-area: color-marker;
        width: 3px;
        margin: 3px;
    }

    .msg-cnt {
        grid-area: message-count;
        text-align: right;
        margin-right: 5px;
        margin-top: 2px;
    }

    .pin {
        grid-area: pin;
        cursor: pointer;
        margin: 3px;
    }
</style>