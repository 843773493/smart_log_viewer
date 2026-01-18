import * as cp from 'child_process';
import * as http from 'http';
import * as path from 'path';
import * as vscode from 'vscode';

export class PythonBackendManager {
	private context: vscode.ExtensionContext;
	private pythonProcess: cp.ChildProcess | null = null;
	private serverPort: number = 5555;
	private isReady: boolean = false;
	private maxRetries: number = 30;
	private retryCount: number = 0;

	constructor(context: vscode.ExtensionContext) {
		this.context = context;
	}

	public async initialize(): Promise<void> {
		const pythonPath = this.getPythonPath();
		const backendPath = path.join(this.context.extensionPath, 'python', 'backend.py');

		try {
			this.pythonProcess = cp.spawn(pythonPath, [backendPath, '--port', this.serverPort.toString()]);

			this.pythonProcess.stdout?.on('data', (data) => {
				console.log(`[Python Backend] ${data}`);
			});

			this.pythonProcess.stderr?.on('data', (data) => {
				console.error(`[Python Backend Error] ${data}`);
			});

			this.pythonProcess.on('error', (error) => {
				console.error('Failed to start Python backend:', error);
			});

			// 等待服务器就绪
			await this.waitForServer();
			console.log('Python backend server started successfully');
		} catch (error) {
			console.error('Error initializing Python backend:', error);
			throw error;
		}
	}

	private getPythonPath(): string {
		// 首先尝试找到系统中的Python
		const platform = process.platform;
		
		// 常见的Python路径
		const pythonPaths = [
			'python3',
			'python',
			'py'
		];

		for (const pythonCmd of pythonPaths) {
			try {
				cp.execSync(`${pythonCmd} --version`, { stdio: 'ignore' });
				return pythonCmd;
			} catch {
				// 继续尝试下一个
			}
		}

		throw new Error('No Python interpreter found. Please install Python 3.7+');
	}

	private async waitForServer(): Promise<void> {
		while (this.retryCount < this.maxRetries) {
			try {
				await this.checkServer();
				this.isReady = true;
				return;
			} catch (error) {
				this.retryCount++;
				await new Promise(resolve => setTimeout(resolve, 500));
			}
		}
		throw new Error('Python backend server failed to start');
	}

	private checkServer(): Promise<void> {
		return new Promise((resolve, reject) => {
			const req = http.get(`http://localhost:${this.serverPort}/health`, (res) => {
				if (res.statusCode === 200) {
					resolve();
				} else {
					reject(new Error(`Server returned status ${res.statusCode}`));
				}
			});

			req.on('error', reject);
			req.setTimeout(1000);
		});
	}

	public async filterLogs(
		content: string,
		filterRegex: string,
		invertFilter: boolean,
		highlightMatches: boolean
	): Promise<any> {
		if (!this.isReady) {
			throw new Error('Python backend is not ready');
		}

		return new Promise((resolve, reject) => {
			const postData = JSON.stringify({
				content,
				filter_regex: filterRegex,
				invert_filter: invertFilter,
				highlight_matches: highlightMatches
			});

			const options = {
				hostname: 'localhost',
				port: this.serverPort,
				path: '/filter',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': Buffer.byteLength(postData)
				}
			};

			const req = http.request(options, (res) => {
				let data = '';

				res.on('data', (chunk) => {
					data += chunk;
				});

				res.on('end', () => {
					try {
						resolve(JSON.parse(data));
					} catch (error) {
						reject(error);
					}
				});
			});

			req.on('error', reject);
			req.write(postData);
			req.end();
		});
	}

	public shutdown(): void {
		if (this.pythonProcess) {
			this.pythonProcess.kill();
			this.pythonProcess = null;
		}
		this.isReady = false;
	}
}
