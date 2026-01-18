// 获取VSCode API
const vscode = acquireVsCodeApi();

// DOM元素
const filterRegexTextarea = document.getElementById('filterRegex');
const invertFilterRegexTextarea = document.getElementById('invertFilterRegex');
const highlightRegexTextarea = document.getElementById('highlightRegex');
const virtualScrollCheckbox = document.getElementById('virtualScrollEnabled');
const itemHeightInput = document.getElementById('itemHeight');
const bufferSizeInput = document.getElementById('bufferSize');
const visibleLinesInput = document.getElementById('visibleLines');
const applyFilterBtn = document.getElementById('applyFilter');
const clearFilterBtn = document.getElementById('clearFilter');
const toggleControlsBtn = document.getElementById('toggleControls');
const controlsContent = document.querySelector('.controls-content');
const logContainer = document.querySelector('.log-container');
const logContent = document.getElementById('logContent');
const logStats = document.getElementById('logStats');

let currentLogLines = [];
let filterState = {
	filterRegex: '',
	useInvertFilter: false,
	invertFilterRegex: '',
	useHighlightFilter: false,
	highlightRegex: '',
	controlsPanelCollapsed: false,
	virtualScrollEnabled: true,
	itemHeight: 20,
	bufferSize: 10,
	visibleLines: 30
};

let scrollState = {
	scrollTop: 0,
	startIndex: 0,
	endIndex: 0,
	renderScheduled: false
};

// 初始化事件监听器
applyFilterBtn.addEventListener('click', applyFilter);
clearFilterBtn.addEventListener('click', clearFilter);
toggleControlsBtn.addEventListener('click', toggleControlsPanel);
logContainer.addEventListener('scroll', handleScroll, true);

// 监听来自扩展的消息
window.addEventListener('message', event => {
	const message = event.data;

	switch (message.type) {
		case 'loadConfig':
			// 加载保存的配置
			loadConfig(message.config);
			break;
		case 'updateContent':
			updateLogContent(message);
			break;
		case 'appendNewLines':
			appendNewLines(message);
			break;
		case 'clearFilter':
			clearFilterUI();
			break;
		case 'error':
			showError(message.message);
			break;
	}
});

function loadConfig(config) {
	// 恢复所有配置
	filterRegexTextarea.value = config.filterRegex || '';
	invertFilterRegexTextarea.value = config.invertFilterRegex || '';
	highlightRegexTextarea.value = config.highlightRegex || '';
	virtualScrollCheckbox.checked = config.virtualScrollEnabled !== false;
	itemHeightInput.value = config.itemHeight || 20;
	bufferSizeInput.value = config.bufferSize || 10;
	visibleLinesInput.value = config.visibleLines || 30;
	
	filterState = {
		filterRegex: config.filterRegex || '',
		useInvertFilter: config.invertFilter || false,
		invertFilterRegex: config.invertFilterRegex || '',
		useHighlightFilter: config.highlightMatches || false,
		highlightRegex: config.highlightRegex || '',
		controlsPanelCollapsed: config.controlsPanelCollapsed || false,
		virtualScrollEnabled: config.virtualScrollEnabled !== false,
		itemHeight: config.itemHeight || 20,
		bufferSize: config.bufferSize || 10,
		visibleLines: config.visibleLines || 30
	};

	// 恢复折叠状态
	if (config.controlsPanelCollapsed) {
		controlsContent.style.display = 'none';
		toggleControlsBtn.textContent = '▶';
	} else {
		controlsContent.style.display = 'block';
		toggleControlsBtn.textContent = '▼';
	}

	// 如果有保存的过滤规则，自动应用
	if (config.filterRegex || config.invertFilterRegex || config.highlightRegex) {
		// 延迟执行，确保UI已更新
		setTimeout(() => {
			applyFilter();
		}, 100);
	}
}

function applyFilter() {
	const filterRegex = filterRegexTextarea.value;
	const invertFilterRegex = invertFilterRegexTextarea.value;
	const highlightRegex = highlightRegexTextarea.value;
	const useInvertFilter = invertFilterRegex.length > 0;
	const useHighlightFilter = highlightRegex.length > 0;
	const virtualScrollEnabled = virtualScrollCheckbox.checked;
	const itemHeight = parseInt(itemHeightInput.value) || 20;
	const bufferSize = parseInt(bufferSizeInput.value) || 10;
	const visibleLines = parseInt(visibleLinesInput.value) || 30;

	// 验证正则表达式
	try {
		if (filterRegex) new RegExp(filterRegex);
		if (invertFilterRegex) new RegExp(invertFilterRegex);
		if (highlightRegex) new RegExp(highlightRegex);
	} catch (error) {
		showError('无效的正则表达式: ' + error.message);
		return;
	}

	filterState = {
		filterRegex,
		useInvertFilter,
		invertFilterRegex,
		useHighlightFilter,
		highlightRegex,
		controlsPanelCollapsed: filterState.controlsPanelCollapsed,
		virtualScrollEnabled,
		itemHeight,
		bufferSize,
		visibleLines
	};

	// 发送消息给扩展
	vscode.postMessage({
		type: 'applyFilter',
		filterRegex: filterRegex,
		useInvertFilter: useInvertFilter,
		invertFilterRegex: invertFilterRegex,
		useHighlightFilter: useHighlightFilter,
		highlightRegex: highlightRegex,
		controlsPanelCollapsed: filterState.controlsPanelCollapsed,
		virtualScrollEnabled: virtualScrollEnabled,
		itemHeight: itemHeight,
		bufferSize: bufferSize,
		visibleLines: visibleLines
	});
}

function clearFilter() {
	filterRegexTextarea.value = '';
	invertFilterRegexTextarea.value = '';
	highlightRegexTextarea.value = '';
	filterState = {
		filterRegex: '',
		useInvertFilter: false,
		invertFilterRegex: '',
		useHighlightFilter: false,
		highlightRegex: '',
		controlsPanelCollapsed: filterState.controlsPanelCollapsed
	};

	vscode.postMessage({
		type: 'clearFilter'
	});
}

function toggleControlsPanel() {
	const isCollapsed = controlsContent.style.display === 'none';
	if (isCollapsed) {
		controlsContent.style.display = 'block';
		toggleControlsBtn.textContent = '▼';
		filterState.controlsPanelCollapsed = false;
	} else {
		controlsContent.style.display = 'none';
		toggleControlsBtn.textContent = '▶';
		filterState.controlsPanelCollapsed = true;
	}

	// 告知扩展更新配置
	vscode.postMessage({
		type: 'toggleControlsPanel',
		collapsed: filterState.controlsPanelCollapsed
	});
}

function clearFilterUI() {
	filterRegexTextarea.value = '';
	invertFilterRegexTextarea.value = '';
	highlightRegexTextarea.value = '';
	logContent.innerHTML = '';
	logStats.textContent = '';
}

function updateLogContent(message) {
	const { logLines, totalLines, matchedLines, highlightedLines, controlsPanelCollapsed } = message;
	
	// 显示统计信息
	const statsText = `总行数: ${totalLines} | 匹配: ${matchedLines} | 显示: ${logLines.length}`;
	logStats.textContent = statsText;

	// 保存当前日志行用于导出
	currentLogLines = logLines;

	// 检查是否启用虚拟滚动
	if (!filterState.virtualScrollEnabled || logLines.length < 100) {
		// 小文件或禁用虚拟滚动时，使用传统渲染
		renderAllLines(logLines, highlightedLines);
		return;
	}

	// 虚拟滚动模式
	renderVirtualScroll(logLines, highlightedLines);
}

function appendNewLines(message) {
	const { newLines, totalLines, matchedLines } = message;
	
	if (!newLines || newLines.length === 0) {
		return;
	}

	console.log(`[appendNewLines] Received ${newLines.length} new lines, totalLines=${totalLines}, matchedLines=${matchedLines}`);

	// 检查是否有过滤规则应用
	const hasActiveFilter = filterState.filterRegex.length > 0 || 
	                        filterState.invertFilterRegex.length > 0 ||
	                        filterState.highlightRegex.length > 0;

	// 如果有过滤规则应用，需要重新应用过滤以保持一致性
	if (hasActiveFilter) {
		console.log('[appendNewLines] Active filter detected, re-applying filter to maintain consistency...');
		// 发送重新应用过滤的请求到后端
		vscode.postMessage({
			type: 'applyFilter',
			filterRegex: filterState.filterRegex,
			useInvertFilter: filterState.useInvertFilter,
			invertFilterRegex: filterState.invertFilterRegex,
			useHighlightFilter: filterState.useHighlightFilter,
			highlightRegex: filterState.highlightRegex,
			controlsPanelCollapsed: filterState.controlsPanelCollapsed,
			virtualScrollEnabled: filterState.virtualScrollEnabled,
			itemHeight: filterState.itemHeight,
			bufferSize: filterState.bufferSize,
			visibleLines: filterState.visibleLines
		});
		return;
	}

	// 没有过滤规则，直接追加新行
	console.log('[appendNewLines] No active filter, appending new lines directly...');
	
	// 更新统计信息
	const statsText = `总行数: ${totalLines} | 匹配: ${matchedLines} | 显示: ${currentLogLines.length + newLines.length}`;
	logStats.textContent = statsText;

	// 添加新行到currentLogLines
	newLines.forEach(lineObj => {
		if (typeof lineObj === 'string') {
			currentLogLines.push(lineObj);
		} else {
			currentLogLines.push(lineObj.text);
		}
	});

	// 如果使用传统渲染模式
	if (!filterState.virtualScrollEnabled || currentLogLines.length < 100) {
		// 创建新行元素并追加
		const highlightedSet = new Set();
		newLines.forEach((lineObj, idx) => {
			if (typeof lineObj === 'object' && lineObj.highlighted) {
				highlightedSet.add(currentLogLines.length - newLines.length + idx);
			}
		});

		newLines.forEach((lineObj, idx) => {
			const lineIndex = currentLogLines.length - newLines.length + idx;
			const lineText = typeof lineObj === 'string' ? lineObj : lineObj.text;
			const isHighlighted = highlightedSet.has(lineIndex);
			const lineElement = createLogLineElement(lineText, lineIndex, isHighlighted);
			logContent.appendChild(lineElement);
		});

		// 自动滚动到底部
		logContainer.scrollTop = logContainer.scrollHeight;
		return;
	}

	// 虚拟滚动模式下的增量更新
	const virtualContainer = logContent.querySelector('.virtual-scroll-container');
	if (!virtualContainer) {
		// 如果没有虚拟滚动容器，重新渲染
		renderVirtualScroll(currentLogLines, []);
		return;
	}

	// 更新容器高度
	const newContainerHeight = currentLogLines.length * filterState.itemHeight;
	virtualContainer.style.height = newContainerHeight + 'px';
	logContent.style.minHeight = newContainerHeight + 'px';

	// 添加新行到虚拟滚动容器 (虚拟滚动中不启用toggle功能)
	newLines.forEach((lineObj, idx) => {
		const lineIndex = currentLogLines.length - newLines.length + idx;
		const lineText = typeof lineObj === 'string' ? lineObj : lineObj.text;
		const isHighlighted = typeof lineObj === 'object' && lineObj.highlighted;
		const lineElement = createLogLineElement(lineText, lineIndex, isHighlighted, false);
		lineElement.style.position = 'absolute';
		lineElement.style.top = (lineIndex * filterState.itemHeight) + 'px';
		lineElement.style.width = '100%';
		lineElement.style.height = filterState.itemHeight + 'px';
		virtualContainer.appendChild(lineElement);
	});

	// 自动滚动到底部
	logContainer.scrollTop = logContainer.scrollHeight;
}

function renderAllLines(logLines, highlightedLines) {
	// 清空日志容器
	logContent.innerHTML = '';
	logContent.style.height = 'auto';
	logContent.style.minHeight = 'auto';

	// 创建行号和内容映射
	const lineMap = new Map();
	if (highlightedLines && highlightedLines.length > 0) {
		highlightedLines.forEach(lineNum => {
			lineMap.set(lineNum, true);
		});
	}

	// 添加日志行
	logLines.forEach((line, index) => {
		const lineElement = createLogLineElement(line, index, lineMap.has(index));
		logContent.appendChild(lineElement);
	});
	
	// 自动滚动到底部
	setTimeout(() => {
		logContainer.scrollTop = logContainer.scrollHeight;
	}, 0);
}

function renderVirtualScroll(logLines, highlightedLines) {
	const containerHeight = logLines.length * filterState.itemHeight;
	
	// 设置容器样式
	logContent.innerHTML = '';
	logContent.style.position = 'relative';
	logContent.style.height = 'auto';
	logContent.style.minHeight = containerHeight + 'px';

	// 创建虚拟滚动容器
	const virtualContainer = document.createElement('div');
	virtualContainer.className = 'virtual-scroll-container';
	virtualContainer.style.position = 'relative';
	virtualContainer.style.width = '100%';
	virtualContainer.style.height = containerHeight + 'px';

	// 创建行号和内容映射
	const lineMap = new Map();
	if (highlightedLines && highlightedLines.length > 0) {
		highlightedLines.forEach(lineNum => {
			lineMap.set(lineNum, true);
		});
	}

	// 计算初始可见范围
	const scrollTop = logContainer.scrollTop || 0;
	const startIndex = Math.max(0, Math.floor(scrollTop / filterState.itemHeight) - filterState.bufferSize);
	const endIndex = Math.min(logLines.length, startIndex + filterState.visibleLines + 2 * filterState.bufferSize);

	// 只渲染可见范围内的行 (虚拟滚动中不启用toggle功能以保持行高一致)
	for (let i = startIndex; i < endIndex; i++) {
		const lineElement = createLogLineElement(logLines[i], i, lineMap.has(i), false);
		lineElement.style.position = 'absolute';
		lineElement.style.top = (i * filterState.itemHeight) + 'px';
		lineElement.style.width = '100%';
		lineElement.style.height = filterState.itemHeight + 'px'; // 固定虚拟滚动中的高度
		virtualContainer.appendChild(lineElement);
	}

	logContent.appendChild(virtualContainer);

	// 更新滚动状态
	scrollState.startIndex = startIndex;
	scrollState.endIndex = endIndex;
}

function createLogLineElement(line, index, isHighlighted, enableToggle = true) {
	const lineElement = document.createElement('div');
	lineElement.className = 'log-line';
	lineElement.style.height = 'auto'; // 改为auto以支持自动高度（在虚拟滚动中会被覆盖）
	lineElement.setAttribute('data-line-index', index);

	const lineNum = document.createElement('span');
	lineNum.className = 'line-number';
	lineNum.textContent = (index + 1).toString().padStart(6, ' ');

	const contentWrapper = document.createElement('div');
	contentWrapper.className = 'line-content-wrapper';
	contentWrapper.style.display = 'flex';
	contentWrapper.style.alignItems = 'flex-start';
	contentWrapper.style.gap = '6px';
	contentWrapper.style.flex = '1';

	const lineContent = document.createElement('span');
	lineContent.className = 'line-content';
	
	// 处理高亮
	if (isHighlighted) {
		lineContent.className += ' highlighted';
	}

	// 检查日志级别并添加颜色分类
	if (line.includes('ERROR') || line.includes('error')) {
		lineElement.classList.add('log-error');
	} else if (line.includes('WARN') || line.includes('warn')) {
		lineElement.classList.add('log-warn');
	} else if (line.includes('INFO') || line.includes('info')) {
		lineElement.classList.add('log-info');
	} else if (line.includes('DEBUG') || line.includes('debug')) {
		lineElement.classList.add('log-debug');
	}

	lineContent.textContent = line;
	
	// 检查文本是否超过容器宽度，如果超过则添加折叠按钮
	contentWrapper.appendChild(lineContent);
	
	// 仅在启用折叠且文本较长时添加折叠按钮
	if (enableToggle && line.length > 60) {
		// 创建一个临时元素来测量文本宽度
		const tempSpan = document.createElement('span');
		tempSpan.className = 'line-content';
		tempSpan.style.position = 'absolute';
		tempSpan.style.visibility = 'hidden';
		tempSpan.style.whiteSpace = 'pre-wrap';
		tempSpan.style.wordBreak = 'break-word';
		tempSpan.textContent = line;
		document.body.appendChild(tempSpan);
		
		const textWidth = tempSpan.offsetWidth;
		const containerWidth = logContainer.clientWidth - 100; // 减去行号和padding
		
		document.body.removeChild(tempSpan);
		
		// 如果文本超宽，添加展开/折叠按钮
		if (textWidth > containerWidth) {
			const toggleBtn = document.createElement('button');
			toggleBtn.className = 'line-toggle-btn';
			toggleBtn.textContent = '▼';
			toggleBtn.title = '点击展开/折叠长行';
			toggleBtn.style.padding = '2px 6px';
			toggleBtn.style.fontSize = '10px';
			toggleBtn.style.minWidth = '24px';
			toggleBtn.style.height = '20px';
			toggleBtn.style.flexShrink = '0';
			
			let isExpanded = false;
			
			toggleBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				isExpanded = !isExpanded;
				
				if (isExpanded) {
					// 展开状态：显示完整文本
					lineContent.style.whiteSpace = 'pre-wrap';
					lineContent.style.wordBreak = 'break-word';
					lineContent.style.maxWidth = 'none';
					lineElement.style.height = 'auto';
					toggleBtn.textContent = '▲';
				} else {
					// 折叠状态：限制文本高度
					lineContent.style.whiteSpace = 'nowrap';
					lineContent.style.overflow = 'hidden';
					lineContent.style.textOverflow = 'ellipsis';
					lineContent.style.maxWidth = containerWidth + 'px';
					lineElement.style.height = filterState.itemHeight + 'px';
					toggleBtn.textContent = '▼';
				}
			});
			
			// 默认折叠状态
			lineContent.style.whiteSpace = 'nowrap';
			lineContent.style.overflow = 'hidden';
			lineContent.style.textOverflow = 'ellipsis';
			lineContent.style.maxWidth = containerWidth + 'px';
			
			contentWrapper.insertBefore(toggleBtn, lineContent);
		}
	}
	
	lineElement.appendChild(lineNum);
	lineElement.appendChild(contentWrapper);
	
	return lineElement;
}

function handleScroll() {
	// 只在启用虚拟滚动且有足够行数时处理
	if (!filterState.virtualScrollEnabled || !currentLogLines || currentLogLines.length < 100) {
		return;
	}

	const scrollTop = logContainer.scrollTop || 0;
	const startIndex = Math.max(0, Math.floor(scrollTop / filterState.itemHeight) - filterState.bufferSize);
	const endIndex = Math.min(currentLogLines.length, startIndex + filterState.visibleLines + 2 * filterState.bufferSize);

	// 如果可见范围没有变化，不需要重新渲染
	if (scrollState.startIndex === startIndex && scrollState.endIndex === endIndex) {
		return;
	}

	// 使用requestAnimationFrame优化性能
	if (scrollState.renderScheduled) {
		return;
	}

	scrollState.renderScheduled = true;

	requestAnimationFrame(() => {
		const virtualContainer = logContent.querySelector('.virtual-scroll-container');
		if (!virtualContainer) return;

		// 清除旧的行元素
		const existingLines = Array.from(virtualContainer.querySelectorAll('.log-line'));
		existingLines.forEach(el => el.remove());

		// 创建行号和内容映射
		const lineMap = new Map();
		if (filterState.highlightRegex) {
			try {
				const regex = new RegExp(filterState.highlightRegex, 'gi');
				for (let i = 0; i < currentLogLines.length; i++) {
					if (regex.test(currentLogLines[i])) {
						lineMap.set(i, true);
					}
					// 重置正则表达式的lastIndex
					regex.lastIndex = 0;
				}
			} catch (e) {
				// 正则表达式错误，跳过高亮
			}
		}

		// 只渲染可见范围内的行 (虚拟滚动中不启用toggle功能)
		for (let i = startIndex; i < endIndex; i++) {
			const lineElement = createLogLineElement(currentLogLines[i], i, lineMap.has(i), false);
			lineElement.style.position = 'absolute';
			lineElement.style.top = (i * filterState.itemHeight) + 'px';
			lineElement.style.width = '100%';
			lineElement.style.height = filterState.itemHeight + 'px';
			virtualContainer.appendChild(lineElement);
		}

		// 更新滚动状态
		scrollState.startIndex = startIndex;
		scrollState.endIndex = endIndex;
		scrollState.renderScheduled = false;
	});
}

function showError(message) {
	const errorElement = document.createElement('div');
	errorElement.className = 'error-message';
	errorElement.textContent = '❌ ' + message;
	logContent.insertBefore(errorElement, logContent.firstChild);

	// 3秒后移除错误消息
	setTimeout(() => {
		errorElement.remove();
	}, 3000);
}

// 导出日志功能
document.addEventListener('keydown', (e) => {
	// Ctrl+S 或 Cmd+S 导出
	if ((e.ctrlKey || e.metaKey) && e.key === 's') {
		e.preventDefault();
		if (currentLogLines.length > 0) {
			vscode.postMessage({
				type: 'exportLogs',
				content: currentLogLines.join('\n')
			});
		}
	}
});

// 页面加载完成
console.log('Smart Log Viewer WebView initialized');
