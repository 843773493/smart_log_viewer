# Changelog

All notable changes to the Smart Log Viewer extension will be documented in this file.

## [0.1.0] - 2026-01-19

### Added
- Initial release of Smart Log Viewer
- Regex-based log filtering with support for multiple independent filter rules
- Three independent filter types:
  - Main filter: Filter lines matching a pattern
  - Invert filter: Show only lines NOT matching a pattern
  - Highlight filter: Highlight lines matching a pattern
- Real-time file monitoring and automatic updates
- Persistent configuration storage per file
- Automatic filter application on file open
- Collapsible settings panel to save screen space
- Virtual scrolling for efficient rendering of large log files (100+ lines)
- Configurable virtual scroll parameters:
  - Item height (row height in pixels)
  - Buffer size (rows above/below viewport)
  - Visible lines (rows visible at once)
- Automatic log level color coding:
  - ERROR: Red
  - WARN: Yellow
  - INFO: Blue
  - DEBUG: Orange
- Real-time statistics display (total lines, matched lines, displayed lines)
- Log export functionality (Ctrl+S / Cmd+S)
- Python-based regex filtering backend
- WebView-based UI with dark theme
- TypeScript extension for VSCode 1.75+

### Features
- **Fast Filtering**: Uses Python backend for efficient regex filtering
- **Smart Rendering**: Virtual scrolling renders only visible rows + buffer
- **Persistent Settings**: Configuration saved per file with automatic restore
- **Real-time Monitoring**: Auto-updates when log files change
- **User-Friendly**: Responsive UI with comprehensive keyboard shortcuts
- **Memory Efficient**: Handles large log files (10k+ lines) smoothly
- **Customizable**: All parameters can be adjusted for optimal performance

## [Unreleased]

### Planned Features
- Search and jump to specific lines
- Multi-file synchronized filtering
- Export filtered results in different formats (CSV, JSON)
- Theme customization
- Custom color schemes for different log levels
- Breakpoint and bookmark functionality
- Advanced pattern builder UI
- Log parsing templates for common formats
