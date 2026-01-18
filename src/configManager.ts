import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export interface LogConfig {
	filterRegex: string;
	invertFilter: boolean;
	invertFilterRegex: string;  // 反向过滤的独立规则
	highlightMatches: boolean;
	highlightRegex: string;      // 高亮的独立规则
	controlsPanelCollapsed: boolean;  // 控制面板折叠状态
	// 虚拟滚动参数
	virtualScrollEnabled: boolean;  // 是否启用虚拟滚动
	itemHeight: number;             // 每行的高度（像素）
	bufferSize: number;             // 缓冲行数（上下各多少行）
	visibleLines: number;           // 可见行数
	[key: string]: any;
}

export class ConfigManager {
	private context: vscode.ExtensionContext;
	private configDir: string;

	constructor(context: vscode.ExtensionContext) {
		this.context = context;
		this.configDir = path.join(context.globalStoragePath, 'log-configs');
		
		// 创建配置目录
		if (!fs.existsSync(this.configDir)) {
			fs.mkdirSync(this.configDir, { recursive: true });
		}
	}

	private getConfigPath(filePath: string): string {
		// 为每个日志文件创建唯一的配置文件
		const hash = this.hashFilePath(filePath);
		return path.join(this.configDir, `${hash}.json`);
	}

	private hashFilePath(filePath: string): string {
		// 使用文件路径的简单哈希
		let hash = 0;
		for (let i = 0; i < filePath.length; i++) {
			const char = filePath.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // 转换为32位整数
		}
		return `config_${Math.abs(hash)}`;
	}

	public getConfig(filePath: string): LogConfig {
		const configPath = this.getConfigPath(filePath);
		
		try {
			if (fs.existsSync(configPath)) {
				const content = fs.readFileSync(configPath, 'utf-8');
				return JSON.parse(content);
			}
		} catch (error) {
			console.error('Error reading config:', error);
		}

		// 返回默认配置
		return {
			filterRegex: '',
			invertFilter: false,
			invertFilterRegex: '',
			highlightMatches: false,
			highlightRegex: '',
			controlsPanelCollapsed: false,
			virtualScrollEnabled: true,
			itemHeight: 20,
			bufferSize: 10,
			visibleLines: 30
		};
	}

	public saveConfig(filePath: string, config: LogConfig): void {
		const configPath = this.getConfigPath(filePath);
		
		try {
			fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
			console.log('Config saved:', configPath);
		} catch (error) {
			console.error('Error saving config:', error);
		}
	}

	public deleteConfig(filePath: string): void {
		const configPath = this.getConfigPath(filePath);
		
		try {
			if (fs.existsSync(configPath)) {
				fs.unlinkSync(configPath);
				console.log('Config deleted:', configPath);
			}
		} catch (error) {
			console.error('Error deleting config:', error);
		}
	}
}
