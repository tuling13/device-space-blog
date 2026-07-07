---
title: 消息队列设计模式：可靠投递、幂等消费与事务消息
date: 2026-06-18
tag:
  - 后端
  - 消息队列
  - 架构设计
description: 基于 RocketMQ/Kafka 的生产实践，详解消息队列的三大核心模式：可靠投递、幂等消费、事务消息。
---

# 消息队列设计模式：可靠投递、幂等消费与事务消息

消息队列是分布式系统的核心组件。但在实际使用中，"消息丢了怎么办？""重复消费怎么处理？""如何保证一致性？"是每个开发者都会遇到的问题。

## 一、可靠投递

### 问题：消息丢失的三个环节

```
Producer → [网络] → Broker → [存储] → Consumer
   ①                  ②                 ③
```

### 环节一：Producer 发送失败

**方案：同步发送 + 重试 + 落库**

```java
@Service
public class ReliableMessageProducer {

    @Resource
    private RocketMQTemplate rocketMQTemplate;

    @Resource
    private MessageLogMapper messageLogMapper;

    @Transactional
    public void sendReliable(String topic, String body, String businessId) {
        // 1. 先落库，记录消息日志
        MessageLog log = new MessageLog();
        log.setMessageId(businessId);
        log.setTopic(topic);
        log.setBody(body);
        log.setStatus("SENDING");
        messageLogMapper.insert(log);

        // 2. 发送消息
        try {
            SendResult result = rocketMQTemplate.syncSend(
                topic,
                MessageBuilder.withPayload(body).build(),
                3000,  // 超时 3 秒
                3      // 重试 3 次
            );
            // 3. 更新状态
            messageLogMapper.updateStatus(businessId, "SENT",
                result.getMsgId());
        } catch (Exception e) {
            log.error("发送失败: {}", businessId, e);
            // 不抛异常，由定时任务补偿
        }
    }
}
```

### 环节二：Broker 宕机

**方案：同步刷盘 + 主从复制**

```java
// Producer 端配置
DefaultMQProducer producer = new DefaultMQProducer("producer-group");
// 同步发送，等待 Broker 确认
producer.setRetryTimesWhenSendFailed(3);
// 消息发送到所有副本后才返回
producer.setSendMsgTimeout(3000);
```

```properties
# Broker 端配置
# 同步刷盘（性能较低但可靠）
flushDiskType = SYNC_FLUSH

# 同步复制（主从都写成功才返回）
brokerRole = SYNC_MASTER
```

### 环节三：Consumer 消费失败

**方案：手动确认 + 重试队列**

```java
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer",
    consumeMode = ConsumeMode.ORDERLY
)
public class OrderConsumer implements RocketMQListener<MessageExt> {

    @Override
    public void onMessage(MessageExt message) {
        try {
            // 业务处理
            processOrder(message);
            // 成功后手动确认（默认自动确认）
        } catch (Exception e) {
            // 抛出异常 → MQ 自动重试
            // 重试次数可在控制台配置，默认 16 次
            throw new RuntimeException("消费失败", e);
        }
    }
}
```

### 定时补偿机制

```java
@Component
public class MessageCompensateTask {

    @Scheduled(fixedDelay = 60000) // 每分钟执行
    public void compensate() {
        // 查询发送失败或未确认的消息
        List<MessageLog> failed = messageLogMapper.selectTimeout(
            "SENDING", LocalDateTime.now().minusMinutes(5)
        );

        for (MessageLog log : failed) {
            // 检查业务是否已完成
            if (isBusinessCompleted(log.getBusinessId())) {
                messageLogMapper.updateStatus(log.getMessageId(), "COMPLETED");
                continue;
            }
            // 重新发送
            rocketMQTemplate.syncSend(log.getTopic(), log.getBody());
        }
    }
}
```

## 二、幂等消费

### 问题：重复消费的场景

```
场景一：Producer 重试 → 同一条消息发了两次
场景二：Consumer 处理成功但 ACK 超时 → MQ 重新投递
场景三：Rebalance → 消息被分配给新的 Consumer 重新消费
```

### 方案一：数据库唯一约束

```java
@Transactional
public void consumeOrder(OrderMessage msg) {
    // 利用唯一索引防止重复插入
    try {
        orderMapper.insert(new Order(msg.getOrderId(), msg.getAmount()));
    } catch (DuplicateKeyException e) {
        log.warn("重复消息: {}", msg.getOrderId());
        return; // 已处理，直接返回
    }
    // 后续业务逻辑
    inventoryService.deduct(msg.getProductId(), msg.getQuantity());
}
```

### 方案二：Redis 去重

```java
@Component
public class IdempotentConsumer {

    @Resource
    private StringRedisTemplate redisTemplate;

    public boolean tryConsume(String messageId) {
        // setIfAbsent = SET NX EX
        String key = "mq:consumed:" + messageId;
        Boolean success = redisTemplate.opsForValue()
            .setIfAbsent(key, "1", 24, TimeUnit.HOURS);

        return Boolean.TRUE.equals(success);
    }

    public void consume(MessageExt msg) {
        String messageId = msg.getMsgId();
        if (!tryConsume(messageId)) {
            return; // 已消费
        }
        // 业务处理
        process(msg);
    }
}
```

### 方案三：业务状态机

```java
@Transactional
public void consumePayment(PaymentMessage msg) {
    // 查询当前订单状态
    Order order = orderMapper.selectById(msg.getOrderId());

    // 状态机校验：只有「待支付」才能转为「已支付」
    if (order.getStatus() != OrderStatus.PENDING) {
        log.info("订单状态已变更: {} -> {}", msg.getOrderId(), order.getStatus());
        return; // 幂等
    }

    // 原子更新状态
    int rows = orderMapper.updateStatus(
        msg.getOrderId(),
        OrderStatus.PENDING,  // 期望旧状态
        OrderStatus.PAID       // 新状态
    );

    if (rows == 0) {
        return; // 并发场景下已被其他线程处理
    }

    // 后续业务
    sendNotification(msg.getOrderId());
}
```

### 方案对比

| 方案 | 可靠性 | 性能 | 复杂度 | 适用场景 |
|------|--------|------|--------|---------|
| DB 唯一约束 | 极高 | 中 | 低 | 必须落库 |
| Redis 去重 | 高 | 高 | 低 | 高吞吐 |
| 状态机 | 极高 | 中 | 中 | 有状态流转 |

## 三、事务消息

### 问题：分布式事务

```
场景：下单 → 减库存 → 发消息通知物流

问题：如果「减库存」成功但「发消息」失败？
     如果「发消息」成功但「减库存」失败？
```

### RocketMQ 事务消息

```
步骤：
1. Producer 发送 Half 消息（prepare）
2. 执行本地事务（减库存、创建订单）
3. 根据本地事务结果：
   - 成功 → Commit → Consumer 可见
   - 失败 → Rollback → Consumer 不可见
4. 如果 Producer 宕机，Broker 回调 check 接口
```

```java
@Service
public class OrderTransactionService {

    @Resource
    private RocketMQTemplate rocketMQTemplate;

    @Transactional
    public void createOrder(OrderDTO dto) {
        String transactionId = UUID.randomUUID().toString();

        // 发送事务消息
        TransactionSendResult result = rocketMQTemplate.sendMessageInTransaction(
            "order-tx-group",
            "order-topic",
            MessageBuilder.withPayload(dto).build(),
            transactionId  // 业务标识
        );

        if (result.getLocalTransactionState() ==
            LocalTransactionState.ROLLBACK_MESSAGE) {
            throw new RuntimeException("事务消息发送失败");
        }
    }
}

// 事务监听器
@RocketMQTransactionListener(txProducerGroup = "order-tx-group")
public class OrderTransactionListener
    implements RocketMQLocalTransactionListener {

    @Override
    public RocketMQLocalTransactionState executeLocalTransaction(
        Message msg, Object arg) {

        OrderDTO dto = (OrderDTO) ((MessageExt) msg).getBody();
        try {
            // 执行本地事务
            orderService.createOrderAndDeductStock(dto);
            return RocketMQLocalTransactionState.COMMIT;
        } catch (Exception e) {
            return RocketMQLocalTransactionState.ROLLBACK;
        }
    }

    @Override
    public RocketMQLocalTransactionState checkLocalTransaction(
        Message msg) {

        // Broker 回调：检查事务状态
        OrderDTO dto = (OrderDTO) ((MessageExt) msg).getBody();
        Order order = orderMapper.selectByOrderNo(dto.getOrderNo());
        
        if (order != null) {
            return RocketMQLocalTransactionState.COMMIT;
        }
        return RocketMQLocalTransactionState.ROLLBACK;
    }
}
```

### Kafka 事务消息

```java
@Configuration
public class KafkaTransactionConfig {

    @Bean
    public KafkaTransactionManager<?> transactionManager(
        ProducerFactory<?, ?> producerFactory) {
        return new KafkaTransactionManager<>(producerFactory);
    }
}

@Service
public class KafkaOrderService {

    @Resource
    private KafkaTemplate<String, String> kafkaTemplate;

    @Transactional  // 与 DB 事务绑定
    public void createOrder(OrderDTO dto) {
        // 1. DB 操作
        orderMapper.insert(dto.toOrder());

        // 2. Kafka 发送（与 DB 事务绑定）
        kafkaTemplate.executeInTransaction(operations -> {
            operations.send("order-created", dto.getOrderNo(), dto);
            operations.send("inventory-deducted",
                dto.getProductId(), dto.getQuantity());
            return true;
        });
        // DB 回滚 → Kafka 消息不发送
    }
}
```

## 四、死信队列

### 处理消费失败的消息

```java
@Component
public class DeadLetterHandler {

    // 正常消费
    @RocketMQMessageListener(
        topic = "order-topic",
        consumerGroup = "order-consumer"
    )
    public class NormalConsumer
        implements RocketMQListener<MessageExt> {
        @Override
        public void onMessage(MessageExt msg) {
            process(msg); // 失败抛异常 → 自动重试
        }
    }

    // 死信队列消费（重试 16 次后进入）
    @RocketMQMessageListener(
        topic = "%DLQ%order-consumer",  // RocketMQ DLQ 格式
        consumerGroup = "order-dlq-consumer"
    )
    public class DLQConsumer
        implements RocketMQListener<MessageExt> {
        @Override
        public void onMessage(MessageExt msg) {
            // 记录失败原因，人工介入或定时补偿
            log.error("死信消息: id={}, body={}, retryTimes={}",
                msg.getMsgId(),
                new String(msg.getBody()),
                msg.getReconsumeTimes()
            );
            // 持久化保存
            deadLetterRepository.save(msg);
            // 发送告警
            alertService.send("死信消息", msg.getMsgId());
        }
    }
}
```

## 五、顺序消息

### 全局有序 vs 分区有序

```java
// 分区有序（推荐）：同一订单的消息发到同一队列
@Component
public class OrderlyProducer {
    @Resource
    private RocketMQTemplate rocketMQTemplate;

    public void sendOrderly(OrderEvent event) {
        // 以 orderId 为 key，相同 key 路由到同一队列
        rocketMQTemplate.syncSendOrderly(
            "order-topic",
            MessageBuilder.withPayload(event).build(),
            event.getOrderId()  // hash key
        );
    }
}

// 顺序消费
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer",
    consumeMode = ConsumeMode.ORDERLY  // 顺序消费
)
public class OrderlyConsumer
    implements RocketMQListener<MessageExt> {
    @Override
    public void onMessage(MessageExt msg) {
        // 同一队列的消息单线程消费，保证顺序
        processOrderly(msg);
    }
}
```

## 六、最佳实践清单

| 实践 | 说明 |
|------|------|
| ✅ 消息体尽量小 | < 1MB，大文件传 URL |
| ✅ 合理设置消费超时 | 避免与重试时间冲突 |
| ✅ 消费者幂等 | 至少一种去重方案 |
| ✅ 监控消费延迟 | `current_offset - committed_offset` |
| ✅ 死信队列告警 | 死信即异常，需要人工处理 |
| ✅ 优雅下线 | 等待消费完再关闭 |
| ❌ 避免长事务 | 消费逻辑控制在秒级 |
| ❌ 避免同步调用 | 消费者内不做 RPC 同步调用 |

## 总结

消息队列的三座大山：

1. **可靠投递**：生产 → Broker → 消费，三步都有保障机制
2. **幂等消费**：DB 唯一约束 / Redis / 状态机，选一个
3. **事务消息**：Half 消息 + 本地事务 + 回查，保证最终一致性

掌握这三个模式，能解决 90% 的消息队列实际问题。
