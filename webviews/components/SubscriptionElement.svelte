<script lang="ts">
    import { ColorManager } from "./ColorManager";
    import type { SubscriptionItem } from "./types";
    import { subscriptions, savedSubscriptions } from './stores';
    import Icon from './Icon.svelte';

    export let subscription: SubscriptionItem;
    export let profileName: string;

    let showMenu = true;

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
    <!--
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
    -->
    {#if !showMenu}
        <div class="menu-icon" on:click={() => {showMenu = true}}>
            <Icon name="menu"></Icon>
        </div>
    {/if}
    {#if showMenu}
        <div class="menu">
            <div class="menu-icon close" on:click={() => {showMenu = false}}>
                <Icon name="close"></Icon>
            </div>
           <ul class="menu-list">
               <li>Mute</li>
               <li>Pin</li>
               <li>Download</li>
           </ul>
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
        grid-template-rows: auto 30px;
        grid-template-columns: 4px 4em auto 2em 7em;
        grid-template-areas: 
            "color-marker topic-label topic menu-icon unsub"
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

    .menu-icon {
        grid-area: menu-icon;
        cursor: pointer;
        margin: 3px;
        z-index: 2;
    }

    .menu {
        grid-area: 1 / 4 / 3 / 6;
        z-index: 1;
        background-color: var(--vscode-input-background);
        width: 100%;
        display: flex;
        flex-direction: row;
        border: 1px solid var(--vscode-textLink-activeForeground);
    }

    .menu-list {
        list-style-type: none;
        margin: 0;
        padding: 0;
    }

    .menu-list li:hover {
        color: var(--vscode-button-foreground);
        cursor: pointer;
    }
</style>