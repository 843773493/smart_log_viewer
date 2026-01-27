import * as path from 'path';
import * as vscode from 'vscode';
import { ConfigManager } from './configManager';
import { outputChannel } from './extension';

export class LogEditorProvider implements vscode.CustomTextEditorProvider {
	private static readonly viewType = 'smartLogViewer.logEditor';
	private configManager: ConfigManager;
	private context: vscode.ExtensionContext;
	private fileWatchers: Map<string, vscode.FileSystemWatcher> = new Map();
	private webviewPanels: Map<string, vscode.WebviewPanel> = new Map();
	private lastContentLength: Map<string, number> = new Map(); // 追踪上次读取的内容长度
	private isFileSystemChange: Map<string, boolean> = new Map(); // 标记是否是文件系统变化
	private changeSubscriptions: Map<string, vscode.Disposable> = new Map(); // 保存文档变化监听器
	private fileChangeTimers: Map<string, NodeJS.Timeout> = new Map(); // 文件变化防抖定时器
	private pollTimers: Map<string, NodeJS.Timeout> = new Map(); // 轮询定时器

	constructor(context: vscode.ExtensionContext) {
		this.context = context;
		this.configManager = new ConfigManager(context);
	}

	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		token: vscode.CancellationToken
	): Promise<void> {
		const filePath = document.uri.fsPath;
		this.webviewPanels.set(filePath, webviewPanel);

		// 设置WebView内容
		webviewPanel.webview.options = {
			enableScripts: true,
			localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'media'))]
		};

		// 加载配置
		const config = this.configManager.getConfig(filePath);

		// 初始化WebView HTML
		webviewPanel.webview.html = this.getWebviewContent(webviewPanel.webview, document.getText());

		// 延迟发送初始配置，确保HTML加载完成
		setTimeout(() => {
			webviewPanel.webview.postMessage({
				type: 'loadConfig',
				config: config
			});
			
			// 无论是否有过滤规则，默认显示全部内容（若有保存的规则会被应用）
			const document_text = document.getText();
			this.updateWebviewContentWithMultipleFilters(filePath, document_text, config);
		}, 500);

		// 监听WebView消息
		webviewPanel.webview.onDidReceiveMessage(async (message) => {
			await this.handleWebviewMessage(message, filePath, webviewPanel);
		});

		// 监听文件变化（外部程序修改）
		this.watchFileChanges(filePath, webviewPanel, document);

		// 监听文档变化（编辑器内修改或外部程序修改）
		const changeSubscription = vscode.workspace.onDidChangeTextDocument(async (event) => {
			if (event.document.uri.fsPath === filePath) {
				// 检查是否是文件系统变化
				const isFileChange = this.isFileSystemChange.get(filePath) || false;
				
				if (isFileChange) {
					// 文件系统变化，由watchFileChanges处理，跳过这里的处理
					this.isFileSystemChange.set(filePath, false);
					return;
				}
				
				// 编辑器内修改，使用完全更新
				const newContent = event.document.getText();
				const config = this.configManager.getConfig(filePath);
				await this.updateWebviewContent(filePath, newContent, config);
			}
		});

		this.changeSubscriptions.set(filePath, changeSubscription);

		webviewPanel.onDidDispose(() => {
			changeSubscription.dispose();
			const storedSubscription = this.changeSubscriptions.get(filePath);
			if (storedSubscription) {
				storedSubscription.dispose();
				this.changeSubscriptions.delete(filePath);
			}
			this.webviewPanels.delete(filePath);
			const watcher = this.fileWatchers.get(filePath);
			if (watcher) {
				watcher.dispose();
				this.fileWatchers.delete(filePath);
			}
			this.lastContentLength.delete(filePath);
			this.isFileSystemChange.delete(filePath);
			
			// 清理文件变化定时器
			const timer = this.fileChangeTimers.get(filePath);
			if (timer) {
				clearTimeout(timer);
				this.fileChangeTimers.delete(filePath);
			}
			
			// 清理轮询定时器
			const pollTimer = this.pollTimers.get(filePath);
			if (pollTimer) {
				clearInterval(pollTimer);
				this.pollTimers.delete(filePath);
			}
		});
	}

	private getWebviewContent(webview: vscode.Webview, logContent: string): string {
		const scriptUri = webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'main.js')));
		const styleUri = webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'style.css')));

		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Smart Log Viewer</title>
	<link rel="stylesheet" href="${styleUri}">
</head>
<body>
	<div class="container">
		<div class="controls">
			<div class="controls-header">
				<h3>📋 日志过滤设置</h3>
				<button id="toggleControls" class="toggle-btn">▼</button>
			</div>
			<div class="controls-content">
				<div class="filter-section">
					<label>主过滤规则 (正则表达式):</label>
					<textarea id="filterRegex" placeholder="输入正则表达式，例如: ERROR|WARN"></textarea>
				</div>
				<div class="filter-section">
					<label>反向过滤规则 (显示不匹配的行):</label>
					<textarea id="invertFilterRegex" placeholder="输入正则表达式，例如: DEBUG"></textarea>
				</div>
				<div class="filter-section">
					<label>高亮过滤规则 (突出显示匹配的行):</label>
					<textarea id="highlightRegex" placeholder="输入正则表达式，例如: ERROR|FATAL"></textarea>
				</div>
				<div class="filter-section">
					<label class="checkbox">
						<input type="checkbox" id="virtualScrollEnabled" checked> 启用虚拟滚动（大文件优化）
					</label>
				</div>
				<div class="params-group">
					<div class="param-item">
						<label for="itemHeight">行高 (像素):</label>
						<input type="number" id="itemHeight" min="16" max="40" value="20">
					</div>
					<div class="param-item">
						<label for="bufferSize">缓冲行数:</label>
						<input type="number" id="bufferSize" min="0" max="100" value="10">
					</div>
					<div class="param-item">
						<label for="visibleLines">可见行数:</label>
						<input type="number" id="visibleLines" min="10" max="100" value="30">
					</div>
				</div>
				<div class="button-group">
					<button id="applyFilter">应用过滤</button>
					<button id="clearFilter">清空所有</button>
				</div>
			</div>
			<div class="info-section">
				<span id="logStats"></span>
			</div>
		</div>
		<div class="log-container">
			<div id="logContent" class="log-content"></div>
		</div>
	</div>
	<script src="${scriptUri}"></script>
</body>
</html>`;
	}

	private watchFileChanges(filePath: string, webviewPanel: vscode.WebviewPanel, document: vscode.TextDocument): void {
		// 初始化内容长度
		this.lastContentLength.set(filePath, document.getText().length);

		// 监听文件系统变化
		const watcher = vscode.workspace.createFileSystemWatcher(
			new vscode.RelativePattern(vscode.Uri.file(path.dirname(filePath)), path.basename(filePath))
		);

		watcher.onDidChange(async () => {
			console.log(`[FileWatcher] File changed: ${filePath}`);
			
			// 清除之前的防抖定时器
			const existingTimer = this.fileChangeTimers.get(filePath);
			if (existingTimer) {
				clearTimeout(existingTimer);
			}

			// 添加防抖延迟，避免频繁更新
			const timer = setTimeout(async () => {
				try {
					// 重新读取文件内容
					const fileContent = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
					const content = new TextDecoder().decode(fileContent);
					const config = this.configManager.getConfig(filePath);
					
					// 检查是否有新的内容被追加
					const lastLength = this.lastContentLength.get(filePath) || 0;
					const currentLength = content.length;
					
					console.log(`[FileWatcher] Detected change: lastLength=${lastLength}, currentLength=${currentLength}`);
					
					// 如果文件内容长度增加，执行增量更新
					if (currentLength > lastLength) {
						console.log('[FileWatcher] Executing incremental update...');
						// 获取新增的内容
						const newContent = content.substring(lastLength);
						await this.appendNewLines(filePath, content, newContent, config);
					} else {
						console.log('[FileWatcher] Executing full update...');
						// 文件被修改或重写，执行完全更新
						await this.updateWebviewContent(filePath, content, config);
					}
					
					// 更新内容长度
					this.lastContentLength.set(filePath, currentLength);
					
					// 标记下一个文档变化事件是由文件系统变化引起的（避免冲突）
					this.isFileSystemChange.set(filePath, true);
				} catch (error) {
					console.error('[FileWatcher] Error reading file:', error);
				}
				
				// 清除定时器记录
				this.fileChangeTimers.delete(filePath);
			}, 200); // 200ms防抖延迟

			this.fileChangeTimers.set(filePath, timer);
		});

		this.fileWatchers.set(filePath, watcher);
		
		// 添加轮询机制作为备用（确保实时更新）
		this.startPollingFileChanges(filePath, webviewPanel);
	}

	private startPollingFileChanges(filePath: string, webviewPanel: vscode.WebviewPanel): void {
		// 每隔500ms轮询一次文件内容
		const pollTimer = setInterval(async () => {
			// 检查webviewPanel是否仍然有效
			if (!this.webviewPanels.has(filePath)) {
				clearInterval(pollTimer);
				this.pollTimers.delete(filePath);
				return;
			}

			try {
				const fileContent = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
				const content = new TextDecoder().decode(fileContent);
				const lastLength = this.lastContentLength.get(filePath) || 0;
				const currentLength = content.length;

				// 检测到文件有变化
				if (currentLength > lastLength) {
					const config = this.configManager.getConfig(filePath);
					const newContent = content.substring(lastLength);
					console.log(`[Polling] Detected new content: ${newContent.length} bytes`);
					
					// 执行增量更新
					await this.appendNewLines(filePath, content, newContent, config);
					this.lastContentLength.set(filePath, currentLength);
					this.isFileSystemChange.set(filePath, true);
				}
			} catch (error) {
				console.error('[Polling] Error polling file:', error);
			}
		}, 500);

		this.pollTimers.set(filePath, pollTimer);
	}

	private async appendNewLines(filePath: string, fullContent: string, newContent: string, config: any): Promise<void> {
		const webviewPanel = this.webviewPanels.get(filePath);
		if (!webviewPanel) {
			return;
		}

		try {
			// 解析新增的行
			const newLines = newContent.split('\n').filter(line => line.length > 0);
			
			if (newLines.length === 0) {
				return;
			}

			console.log(`[appendNewLines] Processing ${newLines.length} new lines`);
			console.log(`[appendNewLines] Config: filterRegex="${config.filterRegex}", invertFilter=${config.invertFilter}, invertFilterRegex="${config.invertFilterRegex}"`);

			outputChannel.appendLine(`[appendNewLines] Processing ${newLines.length} new lines`);
			outputChannel.appendLine(`[appendNewLines] Config details:`);
			outputChannel.appendLine(`  filterRegex: "${config.filterRegex}"`);
			outputChannel.appendLine(`  invertFilterRegex: "${config.invertFilterRegex}"`);
			outputChannel.appendLine(`  invertFilter flag: ${config.invertFilter}`);

			// 应用过滤规则到新增的行
			let filteredNewLines = newLines;
			
			// 应用主过滤规则
			if (config.filterRegex) {
				try {
					const regex = new RegExp(config.filterRegex);
					outputChannel.appendLine(`[appendNewLines] Applying main filter with regex: "${config.filterRegex}"`);
					filteredNewLines = newLines.filter(line => regex.test(line));
					console.log(`[appendNewLines] After main filter: ${newLines.length} → ${filteredNewLines.length} lines`);
				} catch (e) {
					console.error('Invalid main filter regex:', e);
					filteredNewLines = newLines;
				}
			}

			// 应用反向过滤规则（仅当invertFilterRegex不为空时才应用）
			if (config.invertFilterRegex && config.invertFilterRegex.length > 0) {
				try {
					const invertRegex = new RegExp(config.invertFilterRegex);
					const beforeInvert = filteredNewLines.length;
					outputChannel.appendLine(`[appendNewLines] Applying invert filter with regex: "${config.invertFilterRegex}" (before: ${beforeInvert})`);
					filteredNewLines = filteredNewLines.filter(line => !invertRegex.test(line));
					outputChannel.appendLine(`[appendNewLines] After invert filter: ${beforeInvert} → ${filteredNewLines.length} lines`);
					console.log(`[appendNewLines] After invert filter: ${beforeInvert} → ${filteredNewLines.length} lines`);
				} catch (e) {
					console.error('Invalid invert filter regex:', e);
				}
			}

			// 应用高亮规则
			let highlightedLines: { text: string; highlighted: boolean }[] = [];
			if (config.highlightMatches && config.highlightRegex) {
				try {
					const highlightRegex = new RegExp(config.highlightRegex);
					highlightedLines = filteredNewLines.map(line => ({
						text: line,
						highlighted: highlightRegex.test(line)
					}));
				} catch (e) {
					console.error('Invalid highlight regex:', e);
					highlightedLines = filteredNewLines.map(line => ({
						text: line,
						highlighted: false
					}));
				}
			} else {
				highlightedLines = filteredNewLines.map(line => ({
					text: line,
					highlighted: false
				}));
			}

			// 获取总行数和匹配行数
			const allLines = fullContent.split('\n');
			const totalLines = allLines.length;
			let matchedLines = totalLines;

			if (config.filterRegex) {
				try {
					const regex = new RegExp(config.filterRegex);
					matchedLines = allLines.filter(line => regex.test(line)).length;
				} catch (e) {
					matchedLines = totalLines;
				}
			}

			console.log(`[appendNewLines] Final: totalLines=${totalLines}, matchedLines=${matchedLines}, displayLines=${filteredNewLines.length}`);

			// 发送增量更新消息
			webviewPanel.webview.postMessage({
				type: 'appendNewLines',
				newLines: highlightedLines,
				totalLines: totalLines,
				matchedLines: matchedLines
			});
		} catch (error) {
			console.error('Error appending new lines:', error);
		}
	}

	private async updateWebviewContent(filePath: string, content: string, config: any): Promise<void> {
		// 使用多过滤逻辑而不是Python后端，确保规则处理一致
		await this.updateWebviewContentWithMultipleFilters(filePath, content, config);
	}

	private async updateWebviewContentWithMultipleFilters(filePath: string, content: string, config: any): Promise<void> {
		const webviewPanel = this.webviewPanels.get(filePath);
		if (!webviewPanel) {
			return;
		}

		try {
			const lines = content.split('\n');
			let filteredLines = lines;
			let totalLines = lines.length;
			let matchedLines = totalLines;
			let highlightedLines: number[] = [];

			// 应用主过滤规则
			if (config.filterRegex) {
				try {
					const regex = new RegExp(config.filterRegex);
					filteredLines = lines.filter(line => regex.test(line));
					matchedLines = filteredLines.length;
				} catch (e) {
					console.error('Invalid main filter regex:', e);
				}
			}

			// 应用反向过滤规则
			if (config.invertFilter && config.invertFilterRegex) {
				try {
					const invertRegex = new RegExp(config.invertFilterRegex);
					filteredLines = filteredLines.filter(line => !invertRegex.test(line));
				} catch (e) {
					console.error('Invalid invert filter regex:', e);
				}
			}

			// 应用高亮规则
			if (config.highlightMatches && config.highlightRegex) {
				try {
					const highlightRegex = new RegExp(config.highlightRegex);
					filteredLines.forEach((line, index) => {
						if (highlightRegex.test(line)) {
							highlightedLines.push(index);
						}
					});
				} catch (e) {
					console.error('Invalid highlight regex:', e);
				}
			}

			webviewPanel.webview.postMessage({
				type: 'updateContent',
				logLines: filteredLines,
				totalLines: totalLines,
				matchedLines: matchedLines,
				highlightedLines: highlightedLines,
				controlsPanelCollapsed: config.controlsPanelCollapsed || false
			});
		} catch (error) {
			console.error('Error filtering logs:', error);
			webviewPanel.webview.postMessage({
				type: 'error',
				message: 'Failed to filter logs: ' + (error as any).message
			});
		}
	}

	private async handleWebviewMessage(message: any, filePath: string, webviewPanel: vscode.WebviewPanel): Promise<void> {
		switch (message.type) {
			case 'applyFilter':
				{
					outputChannel.appendLine('[handleWebviewMessage] Received applyFilter message:');
					outputChannel.appendLine(`  filterRegex: "${message.filterRegex}"`);
					outputChannel.appendLine(`  useInvertFilter: ${message.useInvertFilter}`);
					outputChannel.appendLine(`  invertFilterRegex: "${message.invertFilterRegex}"`);
					outputChannel.appendLine(`  highlightRegex: "${message.highlightRegex}"`);
					
					const config = {
						filterRegex: message.filterRegex,
						invertFilter: message.useInvertFilter,
						invertFilterRegex: message.invertFilterRegex,
						highlightMatches: message.useHighlightFilter,
						highlightRegex: message.highlightRegex,
						controlsPanelCollapsed: message.controlsPanelCollapsed,
						virtualScrollEnabled: message.virtualScrollEnabled,
						itemHeight: message.itemHeight,
						bufferSize: message.bufferSize,
						visibleLines: message.visibleLines
					};
					
					outputChannel.appendLine('[handleWebviewMessage] Saving config with:');
					outputChannel.appendLine(`  filterRegex: "${config.filterRegex}"`);
					outputChannel.appendLine(`  invertFilterRegex: "${config.invertFilterRegex}"`);
					
					this.configManager.saveConfig(filePath, config);
					
					const document = await vscode.workspace.openTextDocument(filePath);
					const content = document.getText();
					
					// 调用更新逻辑，考虑三个独立的过滤规则
					await this.updateWebviewContentWithMultipleFilters(filePath, content, config);
				}
				break;

			case 'clearFilter':
				{
					const currentConfig = this.configManager.getConfig(filePath);
					const config = {
						filterRegex: '',
						invertFilter: false,
						invertFilterRegex: '',
						highlightMatches: false,
						highlightRegex: '',
						controlsPanelCollapsed: false,
						virtualScrollEnabled: currentConfig.virtualScrollEnabled,
						itemHeight: currentConfig.itemHeight,
						bufferSize: currentConfig.bufferSize,
						visibleLines: currentConfig.visibleLines
					};
					this.configManager.saveConfig(filePath, config);
					
					const document = await vscode.workspace.openTextDocument(filePath);
					const content = document.getText();
					await this.updateWebviewContentWithMultipleFilters(filePath, content, config);
				}
				break;

			case 'toggleControlsPanel':
				{
					// 获取当前配置
					const currentConfig = this.configManager.getConfig(filePath);
					currentConfig.controlsPanelCollapsed = message.collapsed;
					this.configManager.saveConfig(filePath, currentConfig);
				}
				break;

			case 'exportLogs':
				{
					const exportPath = await vscode.window.showSaveDialog({
						defaultUri: vscode.Uri.file(filePath + '.export.log'),
						filters: { 'Log files': ['log'] }
					});

					if (exportPath) {
						await vscode.workspace.fs.writeFile(
							exportPath,
							new TextEncoder().encode(message.content)
						);
						vscode.window.showInformationMessage('日志已导出');
					}
				}
				break;

			case 'log':
				{
					// 来自前端的日志消息
					outputChannel.appendLine('[Frontend] ' + message.message);
				}
				break;
		}
	}

	public clearFilter(): void {
		// 清空所有WebView的过滤
		for (const [filePath, webviewPanel] of this.webviewPanels) {
			const currentConfig = this.configManager.getConfig(filePath);
			this.configManager.saveConfig(filePath, {
				filterRegex: '',
				invertFilter: false,
				invertFilterRegex: '',
				highlightMatches: false,
				highlightRegex: '',
				controlsPanelCollapsed: false,
				virtualScrollEnabled: currentConfig.virtualScrollEnabled,
				itemHeight: currentConfig.itemHeight,
				bufferSize: currentConfig.bufferSize,
				visibleLines: currentConfig.visibleLines
			});
			webviewPanel.webview.postMessage({
				type: 'clearFilter'
			});
		}
	}

	public saveConfig(): void {
		vscode.window.showInformationMessage('配置已保存');
	}
}
