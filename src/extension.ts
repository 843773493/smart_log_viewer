import * as vscode from 'vscode';
import { LogEditorProvider } from './logEditorProvider';
import { PythonBackendManager } from './pythonBackendManager';

let pythonBackendManager: PythonBackendManager;

export async function activate(context: vscode.ExtensionContext) {
	console.log('Smart Log Viewer extension is now active!');

	// 初始化Python后端管理器
	pythonBackendManager = new PythonBackendManager(context);
	await pythonBackendManager.initialize();

	// 注册自定义编辑器提供者
	const logEditorProvider = new LogEditorProvider(context, pythonBackendManager);
	
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
	if (pythonBackendManager) {
		pythonBackendManager.shutdown();
	}
}
