---
title: Claude Code 接入 DeepSeek：低成本 AI 编程实战
date: 2026-07-03
tag:
  - AI
  - Claude Code
  - DeepSeek
description: Claude Code 默认使用 Anthropic 模型，但通过自定义 provider 也能接入 DeepSeek，大幅降低编程成本。
sticky: 1
---

# Claude Code 接入 DeepSeek：低成本 AI 编程实战

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) 是 Anthropic 推出的终端 AI 编程助手。虽然原生绑定 Claude 模型，但通过 OpenAI 兼容接口，我们也能接入 DeepSeek，享受更低的价格。

## 为什么用 DeepSeek 替代 Claude？

| 对比维度 | Claude (Sonnet 4) | DeepSeek-V3 |
|---------|-------------------|-------------|
| 输入价格 | $3/百万 token | ¥1/百万 token |
| 输出价格 | $15/百万 token | ¥2/百万 token |
| 编程能力 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 中文能力 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 上下文窗口 | 200K | 128K |

> DeepSeek 的价格仅为 Claude 的 **1/10 ~ 1/50**，对于日常编程任务完全够用。

## 方案一：通过第三方代理接入（推荐）

由于 Claude Code 目前不支持直接配置自定义 provider，最便捷的方式是通过 OpenAI 兼容代理。

### 使用 One API 中转

[One API](https://github.com/songquanpeng/one-api) 是一个 OpenAI 接口管理 & 分发系统。

#### 1. 部署 One API

```bash
# Docker 部署（推荐）
docker run -d \
  --name one-api \
  -p 3000:3000 \
  -e SQL_DSN="root:123456@tcp(localhost:3306)/oneapi" \
  -v /home/ubuntu/data/one-api:/data \
  justsong/one-api
```

#### 2. 配置渠道

1. 访问 `http://localhost:3000`，登录管理后台
2. 进入「渠道」→ 添加新渠道
3. 类型选择「DeepSeek」
4. 填入 API Key
5. 保存

#### 3. 在 Claude Code 中使用

```bash
# 设置代理地址为 One API
export ANTHROPIC_BASE_URL="http://localhost:3000/v1"

# Claude Code 会通过代理调用 DeepSeek
claude
```

## 方案二：使用 Claude Code 的 MCP 扩展

通过 MCP Server 桥接 DeepSeek：

```json
{
  "mcpServers": {
    "deepseek-bridge": {
      "command": "python",
      "args": ["-m", "deepseek_mcp_bridge"],
      "env": {
        "DEEPSEEK_API_KEY": "sk-xxx",
        "DEEPSEEK_MODEL": "deepseek-chat"
      }
    }
  }
}
```

## 方案三：使用 OpenRouter 中转

[OpenRouter](https://openrouter.ai/) 聚合了多个模型提供商，包括 DeepSeek。

```bash
# 设置 OpenRouter 作为代理
export ANTHROPIC_BASE_URL="https://openrouter.ai/api/v1"
export ANTHROPIC_API_KEY="sk-or-v1-your-openrouter-key"

# 在 Claude Code 中选择 DeepSeek 模型
claude --model deepseek/deepseek-chat
```

## 实战：用 DeepSeek 完成一个全栈功能

以下是一个完整的工作流示例，展示如何在 Claude Code 中用 DeepSeek 开发功能：

```bash
# 1. 启动 Claude Code（已配置 DeepSeek 代理）
claude

# 2. 在交互界面中描述需求
> 帮我创建一个 FastAPI 用户认证模块，包含注册、登录、JWT 鉴权

# 3. Claude Code 会调用 DeepSeek 生成代码
# DeepSeek 会：
# - 分析需求
# - 生成目录结构
# - 编写 auth.py、models.py、schemas.py
# - 提供测试用例

# 4. 审查生成的代码
> 检查 auth.py 中的密码哈希是否安全

# 5. 运行测试
> 运行测试并修复失败用例
```

## 性能对比：实际开发体验

我在一个中等规模的项目中对比了两者的表现：

| 任务 | Claude Sonnet 4 | DeepSeek-V3 | 评价 |
|------|----------------|-------------|------|
| CRUD API 生成 | ✅ 一次通过 | ✅ 一次通过 | 持平 |
| 复杂 SQL 优化 | ✅ 给出最优方案 | ⚠️ 方案可行但非最优 | Claude 略优 |
| 中文文档生成 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | DeepSeek 更优 |
| Bug 修复 | ✅ 准确 | ✅ 准确 | 持平 |
| 架构设计建议 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Claude 略优 |

## 注意事项

### 1. 工具调用兼容性

Claude Code 依赖 Anthropic 特有的 tool_use 格式。部分代理可能不完全兼容，导致工具调用失败。建议：

- 使用最新版 One API（已优化 Claude 工具调用兼容）
- 遇到问题时切换回 Claude 模型处理工具操作

### 2. 上下文长度限制

DeepSeek 最大支持 128K 上下文，Claude 支持 200K。处理超大项目时注意：

```bash
# 使用 .claudeignore 排除无关文件
echo "node_modules/" >> .claudeignore
echo "dist/" >> .claudeignore
echo "*.lock" >> .claudeignore
```

### 3. 混合使用策略

最佳实践是混合使用：

```
日常编码、文档生成 → DeepSeek-V3（省钱）
复杂重构、架构设计 → Claude Sonnet 4（保证质量）
代码审查 → DeepSeek-R1（推理能力强）
```

## 总结

虽然 Claude Code 原生不支持 DeepSeek，但通过代理方案完全可以接入。这种组合特别适合：

- **个人开发者**：大幅降低 AI 编程成本
- **中文项目**：DeepSeek 的中文能力更胜一筹
- **日常 CRUD**：DeepSeek-V3 完全够用

建议保留 Claude 作为复杂任务的备份，日常使用 DeepSeek 即可覆盖 80% 的编程场景。

---

**相关资源**：
- [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)
- [One API GitHub](https://github.com/songquanpeng/one-api)
- [Claude Code 文档](https://docs.anthropic.com/en/docs/claude-code)
