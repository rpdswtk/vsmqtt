import * as vscode from "vscode"

export function showProgressNotification(title: string): vscode.CancellationTokenSource {
  let cancellationToken = new vscode.CancellationTokenSource()

  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      cancellable: false,
      title,
    },
    async () => {
      return new Promise((resolve) => {
        cancellationToken = new vscode.CancellationTokenSource()

        cancellationToken.token.onCancellationRequested(() => {
          cancellationToken?.dispose()
          resolve(null)
          return
        })
      })
    }
  )

  return cancellationToken
}
