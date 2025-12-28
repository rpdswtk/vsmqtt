enum ExtensionMessages {
  brokerConfigChanged = "brokerConfigChanged",
  openMessage = "openMessage",
  clearRetainedTopic = "clearRetainedTopic",
  publish = "publish",
  subscribe = "subscribe",
  unsubscribe = "unsubscribe",
  saveSubscription = "saveSubscription",
  removeSavedSubscription = "removeSavedSubscription",
  exportMessages = "exportMessages",
  onMqttConnectionChange = "onMqttConnectionChange",
  onMqttMessage = "onMqttMessage",
  themeInformationChange = "themeInformationChange",
  saveDefaultPublishValues = "saveDefaultPublishValues",
  reloadBrokerConfig = "reloadBrokerConfig",
}

export default ExtensionMessages
