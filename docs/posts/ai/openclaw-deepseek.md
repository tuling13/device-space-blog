---
title: OpenClaw 接入 DeepSeek 完全指南
date: 2026-07-01
tag:
  - AI
  - OpenClaw
  - DeepSeek
description: 手把手教你如何在 OpenClaw 中配置和使用 DeepSeek 模型，享受高性价比的 AI 编程体验。
sticky: 2
---

# OpenClaw 接入 DeepSeek 完全指南

[OpenClaw](https://github.com/nousresearch/openclaw) 是 Nous Research 推出的开源 AI Agent 框架，支持多种 LLM 后端。本文将详细介绍如何将 DeepSeek 模型接入 OpenClaw，让你的 AI Agent 拥有强大的推理能力。

## 为什么选择 DeepSeek？

DeepSeek 是目前性价比最高的 LLM 之一：

- **DeepSeek-V3**：通用能力对标 GPT-4，价格仅为 1/10
- **DeepSeek-R1**：推理能力极强，数学和编程表现优异
- **极低延迟**：国内访问延迟 < 500ms
- **128K 上下文**：处理超长文档无压力

## 第一步：获取 DeepSeek API Key

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册账号并完成实名认证
3. 在「API Keys」页面创建新的 API Key
4. 充值（建议首次充值 10 元测试）

> 💡 **省钱技巧**：DeepSeek 夜间时段（00:00-08:00）有折扣，适合批量任务。

## 第二步：安装 OpenClaw

```bash
# 使用 pip 安装
pip install openclaw

# 或从源码安装最新版
git clone https://github.com/nousresearch/openclaw.git
cd openclaw
pip install -e .
```

## 第三步：配置 DeepSeek 提供商

OpenClaw 使用 YAML 配置文件管理模型提供商。创建或编辑 `~/.openclaw/config.yaml`：

```yaml
providers:
  deepseek:
    base_url: https://api.deepseek.com/v1
    api_key: ${DEEPSEEK_API_KEY}
    models:
      - deepseek-chat       # DeepSeek-V3
      - deepseek-reasoner   # DeepSeek-R1

default_model: deepseek-chat
```

设置环境变量：

```bash
export DEEPSEEK_API_KEY="sk-your-api-key-here"
```

## 第四步：验证配置

运行以下命令测试连接：

```bash
openclaw chat --model deepseek-chat "你好，请介绍一下你自己"
```

如果返回正常回复，说明配置成功！

## 第五步：创建你的第一个 AI Agent

创建一个简单的代码助手 Agent：

```python
# agent.py
from openclaw import Agent, Tool

class CodeAssistant(Agent):
    """基于 DeepSeek 的编程助手"""

    def __init__(self):
        super().__init__(
            name="小D",
            model="deepseek-chat",
            system_prompt="""你是一个专业的编程助手，擅长：
1. 代码审查与优化建议
2. Bug 排查与修复
3. 技术方案设计
4. 代码解释与文档生成

请用中文回复，代码注释也用中文。""",
            tools=[
                Tool.read_file,
                Tool.write_file,
                Tool.search_code,
                Tool.run_command,
            ]
        )

# 使用示例
if __name__ == "__main__":
    assistant = CodeAssistant()
    assistant.chat()
```

## 第六步：进阶配置

### 使用 DeepSeek-R1 进行复杂推理

```yaml
providers:
  deepseek:
    base_url: https://api.deepseek.com/v1
    api_key: ${DEEPSEEK_API_KEY}
    models:
      - deepseek-chat
      - deepseek-reasoner  # 推理专用

# 为不同任务指定不同模型
task_routing:
  code_review: deepseek-chat
  debug: deepseek-reasoner
  architecture: deepseek-reasoner
  documentation: deepseek-chat
```

### 配置重试和超时

```yaml
providers:
  deepseek:
    base_url: https://api.deepseek.com/v1
    api_key: ${DEEPSEEK_API_KEY}
    timeout: 120
    max_retries: 3
    retry_delay: 5
```

## 常见问题

### Q: 遇到 401 错误怎么办？

检查 API Key 是否正确，是否已设置环境变量 `DEEPSEEK_API_KEY`。

### Q: 响应速度慢？

- 检查网络连接，建议使用国内服务器
- DeepSeek 高峰期可能限流，错峰使用
- 考虑使用 DeepSeek 的[第三方 API 代理](https://cloud.siliconflow.cn/)（硅基流动等）

### Q: 如何切换不同模型？

```bash
# 命令行指定模型
openclaw chat --model deepseek-reasoner "帮我分析这段代码的性能问题"

# 代码中指定
agent = Agent(model="deepseek-reasoner")
```

### Q: 费用如何控制？

- 设置每月预算上限
- 使用 `deepseek-chat` 处理常规任务（¥1/百万 token）
- `deepseek-reasoner` 仅用于复杂推理（¥4/百万 token）
- 监控 API 用量：[DeepSeek 控制台](https://platform.deepseek.com/usage)

## 总结

OpenClaw + DeepSeek 是一个高性价比的 AI Agent 组合。DeepSeek 提供了强大的模型能力，OpenClaw 提供了灵活的 Agent 框架，两者结合可以快速构建各种智能助手。

下一步建议：
- 探索 OpenClaw 的[工具系统](https://github.com/nousresearch/openclaw#tools)，扩展 Agent 能力
- 尝试使用 DeepSeek-R1 处理复杂推理任务
- 结合 [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) 连接更多数据源
