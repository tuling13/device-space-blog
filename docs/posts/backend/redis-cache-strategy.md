---
title: Redis 缓存实战：从穿透到雪崩的完整解决方案
date: 2026-06-25
tag:
  - 后端
  - Redis
  - 缓存
description: 深入剖析 Redis 缓存的三大经典问题——缓存穿透、击穿、雪崩，并提供生产级解决方案和代码示例。
---

# Redis 缓存实战：从穿透到雪崩的完整解决方案

缓存是后端性能优化的核心手段，但不合理的缓存设计会带来新的问题。本文将深入剖析三大经典缓存问题，并提供可直接上线的解决方案。

## 缓存穿透

### 问题描述

查询一个**不存在**的数据，缓存和数据库都没有，导致每次请求都穿透到数据库。

```
客户端 → 缓存(Miss) → 数据库(Miss) → 返回 null
```

高并发下，大量请求会直接打到数据库。

### 解决方案

#### 方案一：布隆过滤器

```java
@Component
public class BloomFilterService {
    private final BloomFilter<String> filter;

    public BloomFilterService() {
        // 预计 100 万数据，误判率 0.01%
        filter = BloomFilter.create(
            Funnels.stringFunnel(Charset.defaultCharset()),
            1_000_000,
            0.0001
        );
    }

    public boolean mightContain(String key) {
        return filter.mightContain(key);
    }

    public void add(String key) {
        filter.put(key);
    }
}

// 使用示例
public User getUser(Long id) {
    String key = "user:" + id;
    if (!bloomFilter.mightContain(key)) {
        return null; // 一定不存在，直接返回
    }
    // 可能存在，继续查询
    User user = cache.get(key);
    if (user == null) {
        user = db.findById(id);
        if (user != null) {
            cache.set(key, user);
        }
    }
    return user;
}
```

#### 方案二：缓存空值

```java
public User getUser(Long id) {
    String key = "user:" + id;
    User user = cache.get(key);

    if (user != null) {
        return user == NULL_USER ? null : user;
    }

    user = db.findById(id);
    if (user == null) {
        // 缓存空对象，设置较短过期时间
        cache.set(key, NULL_USER, 60, TimeUnit.SECONDS);
        return null;
    }

    cache.set(key, user, 30, TimeUnit.MINUTES);
    return user;
}
```

## 缓存击穿

### 问题描述

一个**热点 key** 在过期瞬间，大量并发请求同时查询数据库。

```
时间线：
T0: 热点 key 过期
T1: 1000 个请求同时发现缓存失效
T2: 1000 个请求同时查询数据库 ← 数据库压力骤增
```

### 解决方案

#### 方案一：互斥锁（Mutex）

```java
public User getUser(Long id) {
    String key = "user:" + id;
    User user = cache.get(key);

    if (user != null) {
        return user;
    }

    // 加锁，只有一个线程能查数据库
    String lockKey = "lock:user:" + id;
    try {
        if (redisLock.tryLock(lockKey, 10, TimeUnit.SECONDS)) {
            // 双重检查
            user = cache.get(key);
            if (user != null) {
                return user;
            }
            user = db.findById(id);
            cache.set(key, user, 30, TimeUnit.MINUTES);
            return user;
        } else {
            // 没拿到锁，等待重试
            Thread.sleep(100);
            return getUser(id); // 递归重试
        }
    } finally {
        redisLock.unlock(lockKey);
    }
}
```

#### 方案二：逻辑过期

```java
@Data
public class CacheData<T> {
    private T data;
    private LocalDateTime expireTime; // 逻辑过期时间
}

public User getUser(Long id) {
    String key = "user:" + id;
    CacheData<User> cacheData = cache.get(key);

    if (cacheData == null) {
        return loadAndCache(id, key);
    }

    // 未过期，直接返回
    if (cacheData.getExpireTime().isAfter(LocalDateTime.now())) {
        return cacheData.getData();
    }

    // 已过期，异步更新
    String lockKey = "lock:user:" + id;
    if (redisLock.tryLock(lockKey)) {
        // 开启新线程更新缓存
        threadPool.execute(() -> {
            User user = db.findById(id);
            CacheData<User> newData = new CacheData<>();
            newData.setData(user);
            newData.setExpireTime(LocalDateTime.now().plusMinutes(30));
            cache.set(key, newData);
            redisLock.unlock(lockKey);
        });
    }

    // 返回旧数据，保证可用性
    return cacheData.getData();
}
```

## 缓存雪崩

### 问题描述

**大量 key 同时过期**或 **Redis 宕机**，导致所有请求直接访问数据库。

### 解决方案

#### 方案一：过期时间加随机值

```java
public void setWithRandomExpire(String key, Object value, long baseTimeout) {
    // 在基础过期时间上加 0~30% 的随机值
    long randomDelta = ThreadLocalRandom.current().nextLong(
        (long)(baseTimeout * 0.3)
    );
    cache.set(key, value, baseTimeout + randomDelta, TimeUnit.SECONDS);
}
```

#### 方案二：Redis 高可用架构

```
         ┌─────────────┐
         │   Sentinel   │
         └──────┬──────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───▼───┐  ┌───▼───┐  ┌───▼───┐
│Master │  │Slave-1│  │Slave-2│
│ (RW)  │  │ (RO)  │  │ (RO)  │
└───────┘  └───────┘  └───────┘
```

#### 方案三：多级缓存

```java
@Service
public class MultiLevelCacheService {
    // L1: 本地缓存（Caffeine）
    private final Cache<String, Object> localCache = Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterWrite(1, TimeUnit.MINUTES)
        .build();

    // L2: Redis
    private final RedisTemplate<String, Object> redisCache;

    public Object get(String key) {
        // L1 查询
        Object value = localCache.getIfPresent(key);
        if (value != null) return value;

        // L2 查询
        value = redisCache.opsForValue().get(key);
        if (value != null) {
            localCache.put(key, value);
            return value;
        }

        // DB 查询
        value = db.query(key);
        if (value != null) {
            redisCache.opsForValue().set(key, value, 30, TimeUnit.MINUTES);
            localCache.put(key, value);
        }
        return value;
    }
}
```

## 热点 Key 发现与处理

### 自动发现热点 Key

```java
@Component
public class HotKeyDetector {
    // 使用滑动窗口统计访问频率
    private final ConcurrentHashMap<String, SlidingWindow> counters = new ConcurrentHashMap<>();

    public void recordAccess(String key) {
        counters.computeIfAbsent(key, k -> new SlidingWindow(10, TimeUnit.SECONDS))
                .increment();
    }

    public List<String> getHotKeys(int threshold) {
        return counters.entrySet().stream()
            .filter(e -> e.getValue().getCount() > threshold)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }
}
```

### 热点 Key 多副本

```java
public Object getHotData(String key) {
    // 将热点 key 分散到多个副本
    int replicaIndex = ThreadLocalRandom.current().nextInt(REPLICA_COUNT);
    String replicaKey = key + ":replica:" + replicaIndex;
    return redisCache.get(replicaKey);
}
```

## 缓存更新策略对比

| 策略 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Cache Aside | 简单可控 | 可能短暂不一致 | 读多写少 |
| Read/Write Through | 缓存与DB一致 | 实现复杂 | 一致性要求高 |
| Write Behind | 写入快 | 数据丢失风险 | 写多，允许少量丢失 |

### Cache Aside 实现

```java
// 读：先缓存，没有则查库
public User getUser(Long id) {
    User user = cache.get("user:" + id);
    if (user == null) {
        user = db.findById(id);
        if (user != null) cache.set("user:" + id, user);
    }
    return user;
}

// 写：先更新数据库，再删除缓存
@Transactional
public void updateUser(User user) {
    db.update(user);           // 先写 DB
    cache.delete("user:" + user.getId()); // 再删缓存
}
```

## 监控指标

生产环境中建议监控以下指标：

- **缓存命中率**：`hits / (hits + misses)`，理想值 > 95%
- **缓存穿透率**：空值请求占总请求比例
- **热 Key 数量**：QPS > 1000 的 key 数量
- **Redis 内存使用率**：< 80%
- **Redis 连接数**：连接池使用情况

## 总结

| 问题 | 核心原因 | 解决方案 |
|------|---------|---------|
| 缓存穿透 | 查不存在的数据 | 布隆过滤器 / 缓存空值 |
| 缓存击穿 | 热点 key 过期 | 互斥锁 / 逻辑过期 |
| 缓存雪崩 | 大量 key 同时过期 | 随机过期时间 / 高可用 |

记住核心原则：**缓存不是为了提升性能，而是为了保护数据库**。在设计缓存方案时，始终围绕这个目标来思考。
