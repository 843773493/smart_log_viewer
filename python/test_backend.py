#!/usr/bin/env python3
"""
Smart Log Viewer Backend Tests
"""

import unittest
import json
from backend import LogFilter


class TestLogFilter(unittest.TestCase):
    """日志过滤器测试"""
    
    def test_no_filter(self):
        """测试无过滤规则"""
        content = "Line 1\nLine 2\nLine 3"
        result = LogFilter.filter_logs(content, '')
        self.assertEqual(len(result['filtered_lines']), 3)
        self.assertEqual(result['total_lines'], 3)
    
    def test_simple_filter(self):
        """测试简单的过滤"""
        content = "ERROR: Something went wrong\nINFO: All good\nERROR: Another error"
        result = LogFilter.filter_logs(content, 'ERROR')
        self.assertEqual(len(result['filtered_lines']), 2)
        self.assertEqual(result['matched_lines'], 2)
    
    def test_invert_filter(self):
        """测试反向过滤"""
        content = "ERROR: Something\nINFO: Good\nWARN: Attention"
        result = LogFilter.filter_logs(content, 'ERROR', invert_filter=True)
        self.assertEqual(len(result['filtered_lines']), 2)
    
    def test_highlight_matches(self):
        """测试高亮匹配"""
        content = "ERROR: First\nINFO: Middle\nERROR: Last"
        result = LogFilter.filter_logs(content, 'ERROR', highlight_matches=True)
        self.assertEqual(len(result['highlighted_lines']), 2)
    
    def test_complex_regex(self):
        """测试复杂的正则表达式"""
        content = "2023-01-01 10:00:00 ERROR\n2023-01-01 11:00:00 INFO\n2023-01-01 12:00:00 ERROR"
        result = LogFilter.filter_logs(content, r'\d{2}:00:00 ERROR')
        self.assertEqual(len(result['filtered_lines']), 2)
    
    def test_invalid_regex(self):
        """测试无效的正则表达式"""
        content = "Test content"
        with self.assertRaises(ValueError):
            LogFilter.filter_logs(content, '[invalid')
    
    def test_empty_content(self):
        """测试空内容"""
        result = LogFilter.filter_logs('', 'ERROR')
        self.assertEqual(len(result['filtered_lines']), 1)  # 空字符串分割后有一个空字符串


if __name__ == '__main__':
    unittest.main()
