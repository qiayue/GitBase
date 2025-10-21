'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Code2, CheckCircle2, XCircle, Settings, Info } from 'lucide-react';
import CodeDiffViewer from '@/components/CodeDiffViewer';
import { callOpenRouter, buildCodeGenerationPrompt, parseCodeChanges } from '@/lib/openrouter';
import { getProjectContext, simplifyContext } from '@/lib/codeContext';
import { batchCommitFiles, validateFilePath } from '@/lib/githubCommit';

export default function AIDevPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [featureRequest, setFeatureRequest] = useState('');
  const [generatedChanges, setGeneratedChanges] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [generationLog, setGenerationLog] = useState([]);

  // AI & GitHub Configuration
  const [config, setConfig] = useState({
    openrouterApiKey: '',
    model: 'anthropic/claude-3.5-sonnet',
    githubToken: '',
    githubOwner: '',
    githubRepo: '',
    githubBranch: 'main'
  });

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem('ai-dev-config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem('ai-dev-config', JSON.stringify(config));
    setShowConfig(false);
    setSuccess('配置已保存');
    setTimeout(() => setSuccess(null), 3000);
  };

  const addLog = (message) => {
    setGenerationLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleGenerate = async () => {
    // 验证配置
    if (!config.openrouterApiKey) {
      setError('请先配置 OpenRouter API Key');
      setShowConfig(true);
      return;
    }

    if (!config.githubToken || !config.githubOwner || !config.githubRepo) {
      setError('请先配置 GitHub 信息');
      setShowConfig(true);
      return;
    }

    if (!featureRequest.trim()) {
      setError('请输入功能需求');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedChanges(null);
    setGenerationLog([]);

    try {
      addLog('开始分析项目代码结构...');

      // 1. 获取项目上下文
      const fullContext = await getProjectContext(
        config.githubOwner,
        config.githubRepo,
        config.githubToken,
        config.githubBranch
      );

      const codeContext = simplifyContext(fullContext);
      addLog(`项目分析完成，共发现 ${codeContext.structure.components.length} 个组件`);

      // 2. 构建 AI prompt
      addLog('构建 AI 提示词...');
      const messages = buildCodeGenerationPrompt(featureRequest, codeContext);

      // 3. 调用 AI 生成代码
      addLog(`调用 AI (${config.model}) 生成代码...`);
      const aiResponse = await callOpenRouter(
        config.openrouterApiKey,
        config.model,
        messages,
        8000  // 使用更大的 token 限制以生成完整代码
      );

      addLog('AI 返回成功，正在解析代码修改...');

      // 4. 解析 AI 返回的代码修改
      const changes = parseCodeChanges(aiResponse);
      addLog(`解析完成，将修改 ${changes.files.length} 个文件`);

      // 5. 验证文件路径
      for (const file of changes.files) {
        if (!validateFilePath(file.path)) {
          throw new Error(`不允许修改的文件路径: ${file.path}`);
        }
      }

      setGeneratedChanges(changes);
      addLog('✓ 代码生成完成，请审查修改');
      setSuccess('代码生成成功！请审查后提交');

    } catch (err) {
      console.error('Error generating code:', err);
      addLog(`✗ 错误: ${err.message}`);
      setError(err.message || '代码生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyChanges = async () => {
    if (!generatedChanges) return;

    setIsCommitting(true);
    setError(null);

    try {
      addLog('开始提交代码到 GitHub...');

      const result = await batchCommitFiles({
        owner: config.githubOwner,
        repo: config.githubRepo,
        token: config.githubToken,
        branch: config.githubBranch,
        files: generatedChanges.files,
        commitMessage: generatedChanges.commitMessage || `AI Generated: ${featureRequest.substring(0, 50)}...`
      });

      addLog(`✓ 提交成功！Commit SHA: ${result.commitSha}`);
      setSuccess(`代码已成功提交到 GitHub！(${result.filesChanged} 个文件)`);
      setGeneratedChanges(null);
      setFeatureRequest('');

    } catch (err) {
      console.error('Error applying changes:', err);
      addLog(`✗ 提交失败: ${err.message}`);
      setError(err.message || '代码提交失败，请重试');
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8" />
            AI 功能开发中心
          </h1>
          <p className="text-muted-foreground mt-2">
            让 AI 帮你编写代码，自动提交到 GitHub
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowConfig(!showConfig)}
        >
          <Settings className="h-4 w-4 mr-2" />
          配置
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      {showConfig && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>配置</CardTitle>
            <CardDescription>
              配置 AI 和 GitHub 访问权限
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-1">安全提示</p>
                  <p>所有配置信息仅存储在您的浏览器本地，不会上传到服务器。</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                OpenRouter API Key *
              </label>
              <Input
                type="password"
                value={config.openrouterApiKey}
                onChange={(e) => setConfig({...config, openrouterApiKey: e.target.value})}
                placeholder="sk-or-v1-..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                从 <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline">openrouter.ai</a> 获取 API Key
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                AI 模型
              </label>
              <select
                value={config.model}
                onChange={(e) => setConfig({...config, model: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (推荐)</option>
                <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
                <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
              </select>
            </div>

            <hr className="my-4" />

            <div>
              <label className="block text-sm font-medium mb-2">
                GitHub Token *
              </label>
              <Input
                type="password"
                value={config.githubToken}
                onChange={(e) => setConfig({...config, githubToken: e.target.value})}
                placeholder="ghp_..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                需要 repo 权限的 Personal Access Token
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  GitHub Owner *
                </label>
                <Input
                  value={config.githubOwner}
                  onChange={(e) => setConfig({...config, githubOwner: e.target.value})}
                  placeholder="username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  GitHub Repo *
                </label>
                <Input
                  value={config.githubRepo}
                  onChange={(e) => setConfig({...config, githubRepo: e.target.value})}
                  placeholder="repository"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                分支名称
              </label>
              <Input
                value={config.githubBranch}
                onChange={(e) => setConfig({...config, githubBranch: e.target.value})}
                placeholder="main"
              />
            </div>

            <Button onClick={saveConfig}>
              保存配置
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            功能需求
          </CardTitle>
          <CardDescription>
            用自然语言描述你想要实现的功能，AI 会帮你生成代码
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={featureRequest}
            onChange={(e) => setFeatureRequest(e.target.value)}
            placeholder="例如：我想在首页添加一个轮播图组件，可以展示最新的 3 篇文章，每 5 秒自动切换..."
            rows={6}
            className="resize-none"
            disabled={isGenerating}
          />
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !featureRequest.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                AI 正在生成代码...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                生成代码
              </>
            )}
          </Button>

          {generationLog.length > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-semibold mb-2">执行日志：</p>
              <div className="text-xs font-mono space-y-1 max-h-40 overflow-y-auto">
                {generationLog.map((log, i) => (
                  <div key={i} className="text-muted-foreground">{log}</div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {generatedChanges && (
        <Card>
          <CardHeader>
            <CardTitle>生成的代码修改</CardTitle>
            <CardDescription>
              {generatedChanges.description || '审查 AI 生成的代码，确认无误后提交到 GitHub'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CodeDiffViewer files={generatedChanges.files} />

            <div className="flex gap-2">
              <Button
                onClick={handleApplyChanges}
                disabled={isCommitting}
                className="flex-1"
              >
                {isCommitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    正在提交...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    确认并提交到 GitHub
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setGeneratedChanges(null)}
                disabled={isCommitting}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
