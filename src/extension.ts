import * as vscode from 'vscode';
import { LogEditorProvider } from './logEditorProvider';

export let outputChannel: vscode.OutputChannel;

export async function activate(context: vscode.ExtensionContext) {
	// 创建输出通道
	outputChannel = vscode.window.createOutputChannel('Smart Log Viewer');
	outputChannel.show(true);
	
	outputChannel.appendLine('Smart Log Viewer extension is now active!');
	console.log('Smart Log Viewer extension is now active!');

	// 注册自定义编辑器提供者
	const logEditorProvider = new LogEditorProvider(context);
	
	context.subscriptions.push(
		vscode.window.registerCustomEditorProvider('smartLogViewer.logEditor', logEditorProvider, {
			webviewOptions: {
				retainContextWhenHidden: true,
			}
		})
	);

	// 注册清空过滤器命令
	context.subscriptions.push(
		vscode.commands.registerCommand('smartLogViewer.clearFilter', () => {
			logEditorProvider.clearFilter();
		})
	);

	// 注册保存配置命令
	context.subscriptions.push(
		vscode.commands.registerCommand('smartLogViewer.saveConfig', () => {
			logEditorProvider.saveConfig();
		})
	);
}

export function deactivate() {
	// Cleanup logic here
}
