<script lang="ts">
    import { ColorManager } from "./ColorManager";
    import type { SubscriptionItem } from "./types";
    import { subscriptions, savedSubscriptions, messages } from './stores';
    import Icon from './Icon.svelte';

    export let subscription: SubscriptionItem;
    export let profileName: string;

    let showMenu = false;

    function unsubscribe(subscriptionItem: SubscriptionItem) {
        $subscriptions.delete(subscriptionItem.topic);
        $subscriptions = $subscriptions;

        vscode.postMessage({
            type: "unsubscribe",
            value: { topic: subscriptionItem.topic },
        });
    }

    function handlePin(pin=true) {
        let type = pin ? "saveSubscription" : "removeSavedSubscription";
        let payload = {
            profileName: profileName,
            subscription: {
                topic: subscription.topic,
                qos: subscription.qos
            }
        }

        vscode.postMessage({
            type,
            value: payload
        });

        if (pin) {
            $savedSubscriptions.set(subscription.topic, subscription);
        } else {
            $savedSubscriptions.delete(subscription.topic);
        }

        $savedSubscriptions = $savedSubscriptions;
    }

    function mute() {
        subscription.muted = !subscription.muted;
    }

    function exportLog() {
        vscode.postMessage({
            type: "exportMessages",
            value: { 
                topic: subscription.topic,
                messages: $messages.filter((message) => message.topic === subscription.topic)
            },
        });
    }
</script>

<svelte:window on:click={() => showMenu = false}/>

<div class="list-item">
    <div class="color-marker" style="background-color: {ColorManager.getColor(subscription.topic)};"></div>
    <div class="topic-label">Topic: </div>
    <div class="topic">{subscription.topic}</div>
    {#if !showMenu}
        <div class="menu-icon" on:click={(e) => {
            e.stopPropagation();
            showMenu = true;
        }}>
            <Icon name="menu"></Icon>
        </div>
    {/if}
    {#if showMenu}
        <div class="menu" on:click={(e) => e.stopPropagation()}>
            <div class="menu-icon close" on:click={(e) => {
                    e.stopPropagation();
                    showMenu = false;
                }}>
                <Icon name="close"></Icon>
            </div>
            <ul class="menu-list">
                <li on:click={() => {mute()}}>
                    {#if !subscription.muted}
                        Mute
                    {/if}
                    {#if subscription.muted}
                        Unmute
                    {/if}
                </li>
                {#if $savedSubscriptions.has(subscription.topic)}
                <li on:click={() => handlePin(false)}>Unpin</li>
                {/if}
                {#if !$savedSubscriptions.has(subscription.topic)}
                <li on:click={() => handlePin()}>Pin</li>
                {/if}
                <li on:click={() => exportLog()}>Export csv</li>
            </ul>
        </div>
    {/if}
    <div class="qos">QoS {subscription.qos}</div>
    <div class="status-icons">
        {#if $savedSubscriptions.has(subscription.topic)}
            <Icon name="pinned" title="Pinned" hoverable={false}/>
        {/if}
        {#if subscription.muted}
            <Icon name="mute" title="Muted" hoverable={false}/>
        {/if}
    </div>
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
            "color-marker qos pin-icon . message-count";
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

    .status-icons {
        grid-area: pin-icon;
        margin: 3px;
        display: flex;
        flex-direction: row;
    }
</style>