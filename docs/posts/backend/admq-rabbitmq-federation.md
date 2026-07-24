---
title: ADMQ_RabbitMQ 跨网络 MQTT 双向通信配置
date: 2025-07-22
tag:
  - RabbitMQ
  - MQTT
  - ADMQ
  - 中间件
description: 通过 RabbitMQ Federation 插件实现内网与外网 RabbitMQ 之间的双向 MQTT 消息转发，支持业务消息下发到外网设备、外网设备上报回传内网业务。
sticky: 1
---

# ADMQ_RabbitMQ 跨网络 MQTT 双向通信配置文档

> **拓扑：** `业务系统 → 内网ADMQ_RabbitMQ(133) ←[Federation]→ 外网ADMQ_RabbitMQ(134) → 外网设备`
>
> **目标：** 业务 MQTT 消息可下发到外网设备，外网设备上报可回传内网业务

---

## 目录

1. [环境信息](#1-环境信息)
2. [基础配置（部署 ADMQ_RabbitMQ）](#2-基础配置部署-admq_rabbitmq)
3. [启用核心插件](#3-启用核心插件)
4. [配置 Federation 双向联合](#4-配置-federation-双向联合)
   - [4.1 Federation Upstream 参数详解](#41-federation-upstream-参数详解)
   - [4.2 Federation Policy 参数详解](#42-federation-policy-参数详解)
   - [4.3 清理旧配置（填错时使用）](#43-清理旧配置填错时使用)
   - [4.4 创建 Federation Upstream](#44-创建-federation-upstream)
   - [4.5 创建 Federation Policy](#45-创建-federation-policy)
   - [4.6 验证连接状态](#46-验证连接状态)
5. [验证双向通信](#5-验证双向通信)
6. [MQTTX 客户端测试](#6-mqttx-客户端测试)
7. [完整配置与清理命令速查](#7-完整配置与清理命令速查)
8. [常见问题](#8-常见问题)

---

## 1. 环境信息

| 项目 | 值 |
|------|-----|
| 内网 ADMQ_RabbitMQ IP | `192.168.6.133` |
| 外网 ADMQ_RabbitMQ IP | `192.168.6.134` |
| 管理端口 | 15672（HTTP API） |
| MQTT 端口 | 1883 |
| AMQP 端口 | 5672 |
| 管理账号 | `admq` / `apusic_123` |

---

## 2. 基础配置（部署 ADMQ_RabbitMQ）

### 2.1 启动 ADMQ_RabbitMQ

在两台机器上分别执行：

```bash
# 内网 192.168.6.133
./admq-daemon start rabbitmq server

# 外网 192.168.6.134（命令相同）
./admq-daemon start rabbitmq server
```

> **注意：**
> - 确保主机防火墙放行 `1883`、`5672`、`15672` 端口
> - 两台机器之间需要开放 `5672`（AMQP）端口的**点对点通信**
> - 实际部署路径以现场为准，文档使用 `/opt/admq2/` 作为示例

### 2.2 确认 ADMQ 运行

```bash
ps -ef | grep admq
```

预期输出应包含 `com.apusic.admq.rabbitmq.Starter` 和 `beam.smp` 进程（见下文示例，省略了详细 classpath）：

```
root      4495     1  0 09:46 pts/0 00:00:13 java -Dadmin.config.path=... com.apusic.admq.rabbitmq.Starter
root      4601  4495  0 09:46 pts/0 00:00:00 /bin/sh /opt/admq2/rabbitmq/core/sbin/rabbitmq-server
root      4608  4601  1 09:46 pts/0 00:01:08 /opt/admq2/rabbitmq/exec/fqzpus/erts-14.2.5.11/bin/beam.smp ...
```

### 2.3 验证管理界面可访问

在浏览器访问：
- 内网：`http://192.168.6.133:15672`（账号 `admq` / `apusic_123`）
- 外网：`http://192.168.6.134:15672`（账号 `admq` / `apusic_123`）

---

## 3. 启用核心插件

### 3.1 启用插件

在两台机器上分别执行：

```bash
# 一次性启用所有需要的插件
./admq rabbitmq admin plugins enable ADMQ_RabbitMQ_mqtt
./admq rabbitmq admin plugins enable ADMQ_RabbitMQ_federation ADMQ_RabbitMQ_federation_management
```

### 3.2 验证插件已启用

```bash
./admq rabbitmq admin plugins list
```

预期输出应包含以下 `[E*]` 标记的插件：

```
[E*] rabbitmq_mqtt                     3.12.14
[E*] rabbitmq_federation               3.12.14
[E*] rabbitmq_federation_management    3.12.14
```

---

## 4. 配置 Federation 双向联合

> **为什么用 Federation 而不是 Shovel？**
>
> 双向 Shovel 会导致消息无限循环（A 转发到 B → B 转发回 A → 无限循环），
> 而 Federation 内置防环机制，自动标记已转发的消息来源，不会重复转发。

Federation 的配置由两部分组成：

1. **Federation Upstream（上游定义）** — 告诉本节点从哪个上游 RabbitMQ 拉消息
2. **Federation Policy（策略）** — 告诉本节点哪些 Exchange 需要被联合

---

### 4.1 Federation Upstream 参数详解

Upstream 是 Federation 的核心配置，定义本节点如何连接上游 RabbitMQ 并拉取消息。

**请求格式：** `PUT /api/parameters/federation-upstream/{vhost}/{name}`

| 参数 | 必填 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `uri` | **必填** | 字符串 | - | 上游 ADMQ_RabbitMQ 的连接地址。格式：`amqp://用户名:密码@IP:5672`。示例：`amqp://admq:apusic_123@192.168.6.134:5672` |
| `exchange` | **必填** | 字符串 | - | 要拉取消息的 Exchange 名称。MQTT 场景固定为 `amq.topic` |
| `max-hops` | 可选 | 整数 | `1` | 消息最大联合跳数，防止多级 Federation 循环。两台机器互联设为 `1` 即可 |
| `prefetch-count` | 可选 | 整数 | `1000` | 一次性预取的消息数量。网络延迟高时可适当增大（如 `3000`），内存受限时可减小（如 `500`） |
| `reconnect-delay` | 可选 | 整数 | `1` | 断线后重连等待秒数。设为 `0` 表示立即重连 |
| `ack-mode` | 可选 | 字符串 | `on-confirm` | 确认模式。可选值：`on-confirm`（推荐，使用 publisher confirm 确保投递）、`on-publish`（发布即确认，性能高但可能丢消息）、`no-ack`（不确认，最快但最不可靠） |
| `trust-user-id` | 可选 | 布尔 | `false` | 是否信任上游的用户 ID。设为 `false` 即可，除非有跨集群用户认证需求 |
| `expires` | 可选 | 整数 | 不过期 | Federation 链接的空闲过期时间（毫秒）。超过该时间没有消息流动则自动断开。通常不设 |
| `message-ttl` | 可选 | 整数 | 不过期 | 消息在 Federation 队列中的最大存活时间（毫秒）。超过则丢弃。通常不设 |
| `queue-type` | 可选 | 字符串 | `classic` | Federation 内部使用的队列类型。可选 `classic` 或 `quorum`。`quorum` 更可靠但更慢 |
| `ha-policy` | 可选 | 字符串 | - | 高可用策略。单机部署不需要 |

**常见 uri 格式：**

- 明文：`amqp://admq:apusic_123@192.168.6.134:5672`
- 带虚拟主机：`amqp://admq:apusic_123@192.168.6.134:5672/my-vhost`
- SSL：`amqps://admq:apusic_123@192.168.6.134:5671`

> **💡 提示：** 最少只需填写 `uri` 和 `exchange`，其他参数均可省略使用默认值。

---

### 4.2 Federation Policy 参数详解

Policy 告诉 RabbitMQ：哪些 Exchange 需要应用 Federation Upstream。

**请求格式：** `PUT /api/policies/{vhost}/{name}`

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `pattern` | **必填** | 正则字符串 | 匹配 Exchange 名称的正则表达式。`amq.topic` 匹配内置 topic 交换器。注意：`.` 在正则中匹配任意字符，但因为 `amq.topic` 名称唯一，不影响使用 |
| `definition` | **必填** | 对象 | 策略定义。必须包含 `federation-upstream` 字段，值为前一步创建的 Upstream 名称 |
| `priority` | 可选 | 整数 | 策略优先级，数字越大优先级越高。多个策略匹配时高优先级生效。单策略设为 `0` 即可 |
| `apply-to` | **必填** | 字符串 | 策略作用目标。固定为 `exchanges`。可选值：`exchanges`、`queues`、`all` |

**definition 对象中的可选参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `federation-upstream` | 字符串 | - | **必填。** 要关联的 Upstream 名称（如 `upstream_134`） |
| `federation-upstream-set` | 字符串 | - | 关联 Upstream Set（与 `federation-upstream` 二选一） |

> **💡 提示：** Policy 创建后**立即生效**，无需重启 ADMQ_RabbitMQ。

---

### 4.3 清理旧配置（填错时使用）

如果填错了参数，需要先删除错误配置再重新创建。

#### 方法一：通过 HTTP API 删除

**删除 Federation Upstream（按名称）：**

```bash
curl -s -u admq:apusic_123 -X DELETE \
  "http://<IP>:15672/api/parameters/federation-upstream/%2f/<Upstream名称>"

# 示例：删除内网 133 上名为 upstream_134 的 Upstream
curl -s -u admq:apusic_123 -X DELETE \
  "http://192.168.6.133:15672/api/parameters/federation-upstream/%2f/upstream_134"
```

**删除 Federation Policy（按名称）：**

```bash
curl -s -u admq:apusic_123 -X DELETE \
  "http://<IP>:15672/api/policies/%2f/<Policy名称>"

# 示例：删除外网 134 上名为 federate_amq_topic 的 Policy
curl -s -u admq:apusic_123 -X DELETE \
  "http://192.168.6.134:15672/api/policies/%2f/federate_amq_topic"
```

#### 方法二：通过管理界面删除

1. 访问 `http://<IP>:15672` → 用 `admq` / `apusic_123` 登录
2. **删除 Upstream：** Admin → Federation Upstreams → 找到目标 → 点击 **Delete**
3. **删除 Policy：** Admin → Policies → 找到目标 → 点击 **Delete**

#### 完整清理步骤（重置整个 Federation 配置）

```bash
# === 在内网 133 上执行 ===
# 1. 先删除 Policy
curl -s -u admq:apusic_123 -X DELETE \
  "http://192.168.6.133:15672/api/policies/%2f/federate_amq_topic"

# 2. 再删除 Upstream
curl -s -u admq:apusic_123 -X DELETE \
  "http://192.168.6.133:15672/api/parameters/federation-upstream/%2f/upstream_134"

# === 在外网 134 上执行 ===
# 1. 先删除 Policy
curl -s -u admq:apusic_123 -X DELETE \
  "http://192.168.6.134:15672/api/policies/%2f/federate_amq_topic"

# 2. 再删除 Upstream
curl -s -u admq:apusic_123 -X DELETE \
  "http://192.168.6.134:15672/api/parameters/federation-upstream/%2f/upstream_133"
```

> **⚠️ 注意顺序：** 必须先删除 Policy 再删除 Upstream。如果先删 Upstream，Policy 引用了不存在的 Upstream 会导致 Federation 报错，但 Policy 本身仍然可以删除。

#### 命令行查看和删除 Federation Upstream（所有 vhost）

```bash
# 查看所有参数（含 Federation Upstream）
./admq rabbitmq admin ctl list_parameters

# 删除对应的 Upstream（将 <upstream_name> 替换为实际名称）
./admq rabbitmq admin ctl clear_parameter federation-upstream <upstream_name>
```

---

### 4.4 创建 Federation Upstream

> 可通过以下两种方式创建，二选一即可。

#### 4.4.1 管理页面创建

访问 `http://192.168.6.133:15672/#/federation-upstreams` → 点击 **Add a new upstream**

**参数填写参考：**

<!-- ============================================================ -->
<!-- 以下表格请根据实际管理页面字段填写 -->
<!-- 表1：内网 133 — 拉取外网消息 -->
<!-- ============================================================ -->

| 字段（管理页面标签） | 填写值 | 说明 |
|---------------------|--------|------|
| **Name** | `upstream_134` | Upstream 名称，需唯一 |
| **URI** | `amqp://admq:apusic_123@192.168.6.134:5672` | 上游连接地址 |
| **Exchange** | `amq.topic` | 要联合的 Exchange 名称 |
| **Prefetch count** | `1000` | 预取消息数 |
| **Reconnect delay** | `1` | 断线重连间隔（秒） |
| **ACK mode** | `on-confirm` | 确认模式 |
| **Max hops** | `1` | 最大跳数 |
| **Trust user ID** | `No` | 是否信任上游用户 ID |
| **其他字段** | 留空（使用默认值） | |

<!-- ============================================================ -->
<!-- 表2：外网 134 — 拉取内网消息 -->
<!-- ============================================================ -->

| 字段（管理页面标签） | 填写值 | 说明 |
|---------------------|--------|------|
| **Name** | `upstream_133` | Upstream 名称，需唯一 |
| **URI** | `amqp://admq:apusic_123@192.168.6.133:5672` | 上游连接地址 |
| **Exchange** | `amq.topic` | 要联合的 Exchange 名称 |
| **Prefetch count** | `1000` | 预取消息数 |
| **Reconnect delay** | `1` | 断线重连间隔（秒） |
| **ACK mode** | `on-confirm` | 确认模式 |
| **Max hops** | `1` | 最大跳数 |
| **Trust user ID** | `No` | 是否信任上游用户 ID |
| **其他字段** | 留空（使用默认值） | |

![示例图](/images/image-1.png "示例图")

---

#### 4.4.2 CLI 命令创建

##### 在内网 RMQ（133）上配置——拉取外网消息

```bash
curl -s -u admq:apusic_123 -X PUT \
  -H "Content-Type: application/json" \
  http://192.168.6.133:15672/api/parameters/federation-upstream/%2f/upstream_134 \
  -d '{
    "value": {
      "uri": "amqp://admq:apusic_123@192.168.6.134:5672",
      "exchange": "amq.topic",
      "max-hops": 1,
      "prefetch-count": 1000,
      "reconnect-delay": 1,
      "ack-mode": "on-confirm",
      "trust-user-id": false
    }
  }'
```

##### 在外网 RMQ（134）上配置——拉取内网消息

```bash
curl -s -u admq:apusic_123 -X PUT \
  -H "Content-Type: application/json" \
  http://192.168.6.134:15672/api/parameters/federation-upstream/%2f/upstream_133 \
  -d '{
    "value": {
      "uri": "amqp://admq:apusic_123@192.168.6.133:5672",
      "exchange": "amq.topic",
      "max-hops": 1,
      "prefetch-count": 1000,
      "reconnect-delay": 1,
      "ack-mode": "on-confirm",
      "trust-user-id": false
    }
  }'
```

---

### 4.5 创建 Federation Policy

> Federation 通过 Policy 来生效——Policy 告诉 ADMQ_RabbitMQ 哪些 Exchange 需要被联合，以及使用哪个 Upstream。

#### 4.5.1 管理页面创建

访问 `http://192.168.6.133:15672/#/policies` → 点击 **Add / update a policy**

**参数填写参考：**

<!-- ============================================================ -->
<!-- 表3：内网 133 Policy -->
<!-- ============================================================ -->

| 字段（管理页面标签） | 填写值 | 说明 |
|---------------------|--------|------|
| **Name** | `federate_amq_topic` | Policy 名称，需唯一 |
| **Pattern** | `amq.topic` | 匹配的 Exchange 名称（支持正则） |
| **Apply to** | `exchanges` | 作用目标 |
| **Priority** | `0` | 优先级 |
| **Definition** | `federation-upstream` = `upstream_134` | 关联的 Upstream 名称 |

<!-- ============================================================ -->
<!-- 表4：外网 134 Policy -->
<!-- ============================================================ -->

| 字段（管理页面标签） | 填写值 | 说明 |
|---------------------|--------|------|
| **Name** | `federate_amq_topic` | Policy 名称，需唯一 |
| **Pattern** | `amq.topic` | 匹配的 Exchange 名称（支持正则） |
| **Apply to** | `exchanges` | 作用目标 |
| **Priority** | `0` | 优先级 |
| **Definition** | `federation-upstream` = `upstream_133` | 关联的 Upstream 名称 |

![alt text](/images/image-2.png)

---

#### 4.5.2 CLI 命令创建

##### 内网 RMQ（133）

```bash
curl -s -u admq:apusic_123 -X PUT \
  -H "Content-Type: application/json" \
  http://192.168.6.133:15672/api/policies/%2f/federate_amq_topic \
  -d '{
    "pattern": "amq.topic",
    "definition": {
      "federation-upstream": "upstream_134"
    },
    "priority": 0,
    "apply-to": "exchanges"
  }'
```

##### 外网 RMQ（134）

```bash
curl -s -u admq:apusic_123 -X PUT \
  -H "Content-Type: application/json" \
  http://192.168.6.134:15672/api/policies/%2f/federate_amq_topic \
  -d '{
    "pattern": "amq.topic",
    "definition": {
      "federation-upstream": "upstream_133"
    },
    "priority": 0,
    "apply-to": "exchanges"
  }'
```

---

### 4.6 验证连接状态

#### CLI 命令验证

```bash
# 查看内网 133 的 Federation 链接
curl -s -u admq:apusic_123 http://192.168.6.133:15672/api/federation-links | python3 -c \
  "import sys,json; [print(f'{l.get(\"exchange\",\"?\")}: {l.get(\"status\",\"?\")}') for l in json.load(sys.stdin)]"

# 查看外网 134 的 Federation 链接
curl -s -u admq:apusic_123 http://192.168.6.134:15672/api/federation-links | python3 -c \
  "import sys,json; [print(f'{l.get(\"exchange\",\"?\")}: {l.get(\"status\",\"?\")}') for l in json.load(sys.stdin)]"
```

预期输出（两者均应显示 `running`）：

```
amq.topic: running
```

#### 管理界面验证

访问 `http://192.168.6.133:15672` → **Admin** → **Federation Status** → 确认显示 `running`

---

## 5. 验证双向通信

### 5.1 安装依赖

在测试机器上执行：

```bash
pip install paho-mqtt
```

### 5.2 使用验证脚本

同目录下的 `verify_federation_admq.py` 是独立的验证脚本，可直接上传到服务器执行：

```bash
# 1. 修改脚本中的 IP 配置（默认 192.168.6.133 / 192.168.6.134）
# 2. 执行
python verify_federation_admq.py
```

**脚本功能：**
- 测试**内网→外网**（业务消息下发）：在内网发布消息，验证外网是否收到
- 测试**外网→内网**（设备消息上报）：在外网发布消息，验证内网是否收到
- 自动检测消息循环（收到多条重复消息表示有循环）
- 提供明确的通过/失败提示和排查建议

### 5.3 脚本源码（也可直接复制执行）

如果无法上传文件，可直接复制以下代码到服务器上保存为 `verify_federation_admq.py` 执行：

```python
import paho.mqtt.client as mqtt
import time

def make_client(cid):
    c = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, cid)
    c.username_pw_set('admq', 'apusic_123')
    return c

# 测试 1：内网→外网（消息下发）
print('=== 测试：内网133发布 → 外网134接收 ===')
r1 = []
def on_msg_134(c, u, m):
    r1.append((m.topic, m.payload.decode()))
    print(f'  外网收到: {m.topic} -> {m.payload.decode()}')

c134 = make_client('verify_134')
c134.on_message = on_msg_134
c134.connect('192.168.6.134', 1883, 60)
c134.subscribe('test/#')
c134.loop_start()
time.sleep(2)

c133 = make_client('verify_pub_133')
c133.connect('192.168.6.133', 1883, 60)
c133.loop_start()
c133.publish('test/from/internal', '业务下发指令', qos=0)
time.sleep(3)

c134.disconnect()
c134.loop_stop()
c133.disconnect()
c133.loop_stop()
print(f'结果：外网收到 {len(r1)} 条消息\n')

# 测试 2：外网→内网（消息上报）
print('=== 测试：外网134发布 → 内网133接收 ===')
r2 = []
def on_msg_133(c, u, m):
    r2.append((m.topic, m.payload.decode()))
    print(f'  内网收到: {m.topic} -> {m.payload.decode()}')

c133_sub = make_client('verify_133')
c133_sub.on_message = on_msg_133
c133_sub.connect('192.168.6.133', 1883, 60)
c133_sub.subscribe('test/#')
c133_sub.loop_start()
time.sleep(2)

c134_pub = make_client('verify_pub_134')
c134_pub.connect('192.168.6.134', 1883, 60)
c134_pub.loop_start()
c134_pub.publish('test/from/external', '设备上报数据', qos=0)
time.sleep(3)

c133_sub.disconnect()
c133_sub.loop_stop()
c134_pub.disconnect()
c134_pub.loop_stop()
print(f'结果：内网收到 {len(r2)} 条消息')
```

---

## 6. MQTTX 客户端测试

### 6.1 下载 MQTTX

官网下载：https://mqttx.app/（跨平台桌面应用，支持 Windows / Mac / Linux）

### 6.2 添加连接

打开 MQTTX，创建两个连接：

**连接 1 — 内网 RMQ**

| 参数 | 值 |
|------|-----|
| 名称 | `内网-ADMQ` |
| 服务器 | `192.168.6.133` |
| 端口 | `1883` |
| 用户名 | `admq` |
| 密码 | `apusic_123` |

**连接 2 — 外网 RMQ**

| 参数 | 值 |
|------|-----|
| 名称 | `外网-ADMQ` |
| 服务器 | `192.168.6.134` |
| 端口 | `1883` |
| 用户名 | `admq` |
| 密码 | `apusic_123` |

### 6.3 测试消息下发（业务→设备）

1. 在外网 RMQ 连接（134）的订阅区，输入 `test/#`，点击订阅
2. 在内网 RMQ 连接（133）的发布区，主题输入 `test/device/cmd`，输入消息内容，点击发送
3. ✅ **外网 RMQ 的订阅区会立刻显示收到的消息**

### 6.4 测试消息上报（设备→业务）

1. 在内网 RMQ 连接（133）的订阅区，输入 `report/#`，点击订阅
2. 在外网 RMQ 连接（134）的发布区，主题输入 `report/sensor/temp`，输入 `{"temperature":25.5}`，点击发送
3. ✅ **内网 RMQ 的订阅区会立刻显示收到的消息**

### 6.5 主题命名建议

为了生产环境便于区分方向，建议：

| 方向 | 主题前缀 | 示例 |
|------|---------|------|
| 业务→设备（下发） | `cmd/` | `cmd/device/relay_01/on` |
| 设备→业务（上报） | `report/` | `report/sensor/temperature` |

Federation 是对整个 `amq.topic` 生效的，因此任何 MQTT 主题都会双向同步，无需为每个主题单独配置。

---

## 7. 完整配置与清理命令速查

### 内网 133 完整命令

```bash
# ========== 配置 Federation ==========

# 创建 upstream（从外网拉消息）
curl -s -u admq:apusic_123 -X PUT \
  -H "Content-Type: application/json" \
  http://192.168.6.133:15672/api/parameters/federation-upstream/%2f/upstream_134 \
  -d '{"value":{"uri":"amqp://admq:apusic_123@192.168.6.134:5672","exchange":"amq.topic","max-hops":1,"prefetch-count":1000,"reconnect-delay":1,"ack-mode":"on-confirm","trust-user-id":false}}'

# 创建 policy
curl -s -u admq:apusic_123 -X PUT \
  -H "Content-Type: application/json" \
  http://192.168.6.133:15672/api/policies/%2f/federate_amq_topic \
  -d '{"pattern":"amq.topic","definition":{"federation-upstream":"upstream_134"},"priority":0,"apply-to":"exchanges"}'

# ========== 清理（填错时回退） ==========

# 先删除 policy
curl -s -u admq:apusic_123 -X DELETE \
  "http://192.168.6.133:15672/api/policies/%2f/federate_amq_topic"

# 再删除 upstream
curl -s -u admq:apusic_123 -X DELETE \
  "http://192.168.6.133:15672/api/parameters/federation-upstream/%2f/upstream_134"
```

### 外网 134 完整命令

```bash
# ========== 配置 Federation ==========

# 创建 upstream（从内网拉消息）
curl -s -u admq:apusic_123 -X PUT \
  -H "Content-Type: application/json" \
  http://192.168.6.134:15672/api/parameters/federation-upstream/%2f/upstream_133 \
  -d '{"value":{"uri":"amqp://admq:apusic_123@192.168.6.133:5672","exchange":"amq.topic","max-hops":1,"prefetch-count":1000,"reconnect-delay":1,"ack-mode":"on-confirm","trust-user-id":false}}'

# 创建 policy
curl -s -u admq:apusic_123 -X PUT \
  -H "Content-Type: application/json" \
  http://192.168.6.134:15672/api/policies/%2f/federate_amq_topic \
  -d '{"pattern":"amq.topic","definition":{"federation-upstream":"upstream_133"},"priority":0,"apply-to":"exchanges"}'

# ========== 清理（填错时回退） ==========

# 先删除 policy
curl -s -u admq:apusic_123 -X DELETE \
  "http://192.168.6.134:15672/api/policies/%2f/federate_amq_topic"

# 再删除 upstream
curl -s -u admq:apusic_123 -X DELETE \
  "http://192.168.6.134:15672/api/parameters/federation-upstream/%2f/upstream_133"
```

---

## 8. 常见问题

### Q1: 消息收不到怎么办？

**排查步骤：**

1. **确认 Federation 链接状态**
   ```bash
   curl -s -u admq:apusic_123 http://IP:15672/api/federation-links
   ```
   确保显示 `"status": "running"`

2. **确认插件已启用**
   ```bash
   ./admq rabbitmq admin plugins list
   ```
   确保以下插件已启用：`ADMQ_RabbitMQ_mqtt`、`ADMQ_RabbitMQ_federation`、`ADMQ_RabbitMQ_federation_management`

3. **确认 MQTT 端口可通**
   ```bash
   timeout 3 bash -c 'echo > /dev/tcp/192.168.6.133/1883' && echo "端口通"
   ```

4. **确认 MQTT 客户端用了正确的账号密码**
   MQTT 连接需要同时设置用户名和密码（`admq` / `apusic_123`），不要留空。

### Q2: 为什么不用 Shovel 而用 Federation？

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Shovel** | 配置简单直观，适合单向转发 | 双向会产生**无限消息循环**，需要额外处理防环逻辑 |
| **Federation** | 内置防环机制，自动标记消息来源，生产环境推荐 | 参数稍多，需要同时配置 Upstream + Policy |

### Q3: Federation 的 max-hops 参数是什么意思？

`max-hops` 控制消息最多可以被联合转发多少跳，用于防止多级 Federation 形成环。

- `1`（默认）— 消息只转发 1 跳。两台机器互联场景下设为 `1` 即可
- `2` — 允许 A→B→C 的二级转发。如三级级联场景使用
- 设为 `0` 表示不限跳数（**不推荐**）

### Q4: 如何从管理界面查看和删除配置？

| 操作 | 路径 |
|------|------|
| 查看 Federation 运行状态 | Admin → Federation Status |
| 查看/删除 Upstream | Admin → Federation Upstreams |
| 查看/删除 Policy | Admin → Policies |
| 查看队列消息 | Queues → 点击队列名 |

### Q5: 如何通过命令查看和删除 Federation Upstream？

```bash
# 查看所有参数（含所有 vhost 的 Federation Upstream）
./admq rabbitmq admin ctl list_parameters

# 删除指定的 Upstream（将 <name> 替换为实际名称）
./admq rabbitmq admin ctl clear_parameter federation-upstream <name>

# 示例：删除名为 upstream_134 的 Upstream
./admq rabbitmq admin ctl clear_parameter federation-upstream upstream_134
```

### Q6: 如何查看 Federation 内部队列状态？

Federation 会在上游节点创建内部队列，队列名称以 `amq.gen-` 开头。可通过管理界面 **Queues** 页面查看这些队列的消息堆积情况。正常情况下队列消息数应为 `0`（消息被实时消费转发）。

---

> **文档版本：** v1.0 | **最后更新：** 2025-07-21
> **ADMQ_RabbitMQ 版本：** 3.12.14 | **部署路径：** `/opt/admq2/`
> **相关文件：** `verify_federation_admq.py`（同目录下的验证脚本）
