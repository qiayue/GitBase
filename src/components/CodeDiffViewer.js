'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, FileCode, FilePlus } from 'lucide-react';

/**
 * 代码 Diff 查看组件
 * 显示文件修改的对比视图
 */
export default function CodeDiffViewer({ files }) {
  const [expandedFiles, setExpandedFiles] = useState(new Set());

  const toggleFile = (index) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFiles(newExpanded);
  };

  const expandAll = () => {
    setExpandedFiles(new Set(files.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedFiles(new Set());
  };

  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {files.length} 个文件将被修改
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={expandAll}>
            展开全部
          </Button>
          <Button size="sm" variant="outline" onClick={collapseAll}>
            折叠全部
          </Button>
        </div>
      </div>

      {files.map((file, index) => {
        const isExpanded = expandedFiles.has(index);
        const isNewFile = file.action === 'create';

        return (
          <Card key={index} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer hover:bg-muted/50 transition-colors p-4"
              onClick={() => toggleFile(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  {isNewFile ? (
                    <FilePlus className="h-4 w-4 text-green-600" />
                  ) : (
                    <FileCode className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="font-mono text-sm">{file.path}</span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    isNewFile
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {isNewFile ? '新文件' : '修改'}
                </span>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="p-0">
                <pre className="bg-muted p-4 overflow-auto max-h-96 text-xs">
                  <code>{file.content}</code>
                </pre>
                <div className="px-4 py-2 bg-muted/50 border-t text-xs text-muted-foreground">
                  {file.content.split('\n').length} 行代码
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/**
 * 简单的行级 Diff 组件（可选，用于显示更详细的对比）
 */
export function LineDiffViewer({ oldContent, newContent }) {
  const oldLines = (oldContent || '').split('\n');
  const newLines = newContent.split('\n');
  const maxLines = Math.max(oldLines.length, newLines.length);

  return (
    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
      {/* 旧内容 */}
      <div className="border-r">
        <div className="bg-red-100 text-red-700 px-2 py-1 font-semibold">
          旧版本
        </div>
        <pre className="p-2 overflow-auto max-h-96 bg-red-50">
          <code>
            {oldLines.map((line, i) => (
              <div key={i} className="hover:bg-red-100">
                <span className="text-muted-foreground mr-2 select-none">
                  {i + 1}
                </span>
                {line}
              </div>
            ))}
          </code>
        </pre>
      </div>

      {/* 新内容 */}
      <div>
        <div className="bg-green-100 text-green-700 px-2 py-1 font-semibold">
          新版本
        </div>
        <pre className="p-2 overflow-auto max-h-96 bg-green-50">
          <code>
            {newLines.map((line, i) => (
              <div key={i} className="hover:bg-green-100">
                <span className="text-muted-foreground mr-2 select-none">
                  {i + 1}
                </span>
                {line}
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
