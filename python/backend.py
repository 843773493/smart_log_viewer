#!/usr/bin/env python3
"""
Smart Log Viewer Python Backend
This backend service handles log filtering with regex patterns
"""

import json
import re
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class LogFilter:
    """日志过滤处理器"""
    
    @staticmethod
    def filter_logs(content, filter_regex, invert_filter=False, highlight_matches=False):
        """
        过滤日志内容
        
        Args:
            content: 日志内容字符串
            filter_regex: 正则表达式字符串
            invert_filter: 是否反向过滤（显示不匹配的行）
            highlight_matches: 是否高亮匹配的行
        
        Returns:
            dict: 包含过滤结果的字典
        """
        lines = content.split('\n')
        total_lines = len(lines)
        
        filtered_lines = []
        highlighted_lines = []
        
        try:
            # 如果没有过滤规则，返回所有行
            if not filter_regex or filter_regex.strip() == '':
                return {
                    'filtered_lines': lines,
                    'total_lines': total_lines,
                    'matched_lines': total_lines,
                    'highlighted_lines': []
                }
            
            # 编译正则表达式
            pattern = re.compile(filter_regex)
            
            # 过滤行
            for idx, line in enumerate(lines):
                is_match = bool(pattern.search(line))
                
                # 根据反向过滤标志决定是否包含此行
                should_include = is_match if not invert_filter else not is_match
                
                if should_include:
                    filtered_lines.append(line)
                    # 如果需要高亮并且这行匹配，记录其索引
                    if highlight_matches and is_match:
                        highlighted_lines.append(len(filtered_lines) - 1)
            
            matched_lines = sum(1 for line in lines if pattern.search(line))
            
            return {
                'filtered_lines': filtered_lines,
                'total_lines': total_lines,
                'matched_lines': matched_lines,
                'highlighted_lines': highlighted_lines
            }
        
        except re.error as e:
            logger.error(f"Invalid regex pattern: {e}")
            raise ValueError(f"Invalid regex pattern: {str(e)}")


class RequestHandler(BaseHTTPRequestHandler):
    """HTTP请求处理器"""
    
    def do_GET(self):
        """处理GET请求"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok'}).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        """处理POST请求"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/filter':
            try:
                # 读取请求体
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                
                # 解析JSON数据
                data = json.loads(body)
                
                # 提取参数
                log_content = data.get('content', '')
                filter_regex = data.get('filter_regex', '')
                invert_filter = data.get('invert_filter', False)
                highlight_matches = data.get('highlight_matches', False)
                
                # 执行过滤
                result = LogFilter.filter_logs(
                    log_content,
                    filter_regex,
                    invert_filter,
                    highlight_matches
                )
                
                # 发送响应
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())
                
            except ValueError as e:
                # 正则表达式错误
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                error_response = {'error': str(e)}
                self.wfile.write(json.dumps(error_response).encode())
                
            except Exception as e:
                logger.error(f"Error processing request: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                error_response = {'error': 'Internal server error'}
                self.wfile.write(json.dumps(error_response).encode())
        
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        """自定义日志消息"""
        logger.info(format % args)


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='Smart Log Viewer Backend Server')
    parser.add_argument('--port', type=int, default=5555, help='Server port (default: 5555)')
    parser.add_argument('--host', default='127.0.0.1', help='Server host (default: 127.0.0.1)')
    
    args = parser.parse_args()
    
    # 创建服务器
    server_address = (args.host, args.port)
    httpd = HTTPServer(server_address, RequestHandler)
    
    logger.info(f'Smart Log Viewer Backend Server started on {args.host}:{args.port}')
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info('Server shutdown')
        httpd.shutdown()


if __name__ == '__main__':
    main()
