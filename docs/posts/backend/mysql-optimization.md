---
title: MySQL 性能优化实战：从慢查询到索引设计
date: 2026-06-22
tag:
  - 后端
  - MySQL
  - 性能优化
description: 系统梳理 MySQL 性能优化的完整路径：慢查询定位、索引设计原则、SQL 改写技巧，以及大表优化方案。
---

# MySQL 性能优化实战：从慢查询到索引设计

数据库往往是系统瓶颈所在。本文将从实际生产问题出发，系统梳理 MySQL 优化的完整路径。

## 一、慢查询定位

### 开启慢查询日志

```sql
-- 查看当前配置
SHOW VARIABLES LIKE 'slow_query%';
SHOW VARIABLES LIKE 'long_query_time';

-- 开启慢查询（临时生效）
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- 超过 1 秒记录
SET GLOBAL log_queries_not_using_indexes = 'ON';

-- 永久生效（my.cnf）
[mysqld]
slow_query_log = 1
long_query_time = 1
slow_query_log_file = /var/log/mysql/slow.log
log_queries_not_using_indexes = 1
```

### 分析慢查询日志

```bash
# 使用 mysqldumpslow 工具
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log
# -s t: 按耗时排序
# -t 10: 显示 Top 10

# 使用 pt-query-digest（推荐）
pt-query-digest /var/log/mysql/slow.log
```

### EXPLAIN 分析

```sql
EXPLAIN SELECT * FROM orders WHERE user_id = 100 AND status = 'PAID';

-- 重点关注字段：
-- type: 访问类型（ALL < index < range < ref < eq_ref < const）
-- key: 实际使用的索引
-- rows: 扫描行数
-- Extra: Using filesort / Using temporary（需要优化）
```

## 二、索引设计原则

### 联合索引的最左前缀原则

```sql
-- 创建联合索引
CREATE INDEX idx_user_status_time ON orders(user_id, status, create_time);

-- ✅ 命中索引（匹配最左列）
SELECT * FROM orders WHERE user_id = 100;

-- ✅ 命中索引（匹配前两列）
SELECT * FROM orders WHERE user_id = 100 AND status = 'PAID';

-- ✅ 命中索引（LIKE 在前两列精确匹配后）
SELECT * FROM orders WHERE user_id = 100 AND status = 'PAID'
AND create_time > '2026-01-01';

-- ❌ 不命中索引（跳过 user_id，无法使用最左列）
SELECT * FROM orders WHERE status = 'PAID';

-- ❌ 不命中索引（范围查询后的列失效）
SELECT * FROM orders WHERE user_id > 100 AND status = 'PAID';
```

### 索引选择口诀

```
等值放前面，范围放后面
区分度高的放前面
覆盖索引：查询列都在索引中
避免 SELECT *，只查需要的列
```

### 覆盖索引

```sql
-- 创建覆盖索引
CREATE INDEX idx_user_status_amount_time
ON orders(user_id, status, amount, create_time);

-- ✅ 完全覆盖：不需要回表
SELECT user_id, status, amount, create_time
FROM orders
WHERE user_id = 100 AND status = 'PAID';

-- ❌ 需要回表（total_price 不在索引中）
SELECT user_id, status, total_price
FROM orders
WHERE user_id = 100 AND status = 'PAID';
```

## 三、SQL 改写技巧

### 1. 避免索引失效

```sql
-- ❌ 函数包裹列，索引失效
SELECT * FROM orders WHERE DATE(create_time) = '2026-07-01';

-- ✅ 改用范围查询
SELECT * FROM orders
WHERE create_time >= '2026-07-01 00:00:00'
  AND create_time < '2026-07-02 00:00:00';

-- ❌ 左模糊查询，索引失效
SELECT * FROM users WHERE name LIKE '%小明';

-- ✅ 右模糊可以使用索引
SELECT * FROM users WHERE name LIKE '小明%';

-- ❌ OR 连接非索引列
SELECT * FROM orders WHERE user_id = 100 OR amount > 1000;

-- ✅ 改用 UNION
SELECT * FROM orders WHERE user_id = 100
UNION
SELECT * FROM orders WHERE amount > 1000;
```

### 2. 分页优化

```sql
-- ❌ 大偏移量分页：扫描前 100000 行再丢弃
SELECT * FROM orders ORDER BY id LIMIT 100000, 20;

-- ✅ 方案一：基于上次 ID 的游标分页
SELECT * FROM orders
WHERE id > 99999
ORDER BY id LIMIT 20;

-- ✅ 方案二：子查询先查 ID
SELECT * FROM orders
WHERE id >= (SELECT id FROM orders ORDER BY id LIMIT 100000, 1)
ORDER BY id LIMIT 20;
```

### 3. JOIN 优化

```sql
-- ❌ 小表 JOIN 大表
SELECT * FROM big_table b
JOIN small_table s ON b.s_id = s.id;

-- ✅ 大表 JOIN 小表（驱动表选小表）
SELECT * FROM small_table s
JOIN big_table b ON s.id = b.s_id;

-- ✅ 有索引的列作为 JOIN 条件
-- 确保 b.s_id 和 s.id 都有索引
```

### 4. IN 与 EXISTS 选择

```sql
-- 外层表大，内层表小 → IN
SELECT * FROM orders
WHERE user_id IN (SELECT id FROM users WHERE status = 'ACTIVE');

-- 外层表小，内层表大 → EXISTS
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.user_id = u.id AND o.amount > 1000
);

-- MySQL 8.0+ 优化器较好，差别不大，但了解原理有助 debug
```

## 四、大表优化方案

### 1. 垂直拆分

```
原表：users (id, name, email, avatar_url, biography, preferences_json...)

拆分为：
users_main (id, name, email)
users_profile (id, avatar_url, biography)
users_config (id, preferences_json)
```

### 2. 水平拆分（分表）

```sql
-- 按时间分表
orders_202601
orders_202602
orders_202603
...

-- 按用户 ID 取模分表
orders_0  -- user_id % 4 = 0
orders_1  -- user_id % 4 = 1
orders_2  -- user_id % 4 = 2
orders_3  -- user_id % 4 = 3
```

### 3. 分区表

```sql
-- 按范围分区（Range Partitioning）
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT,
    user_id BIGINT,
    amount DECIMAL(10,2),
    create_time DATETIME,
    PRIMARY KEY (id, create_time)
) PARTITION BY RANGE (YEAR(create_time)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

### 4. 冷热数据分离

```
热数据（近 3 个月）→ MySQL
温数据（3-12 个月）→ TiDB / 归档表
冷数据（1 年以上）  → 对象存储 + Hive
```

## 五、实战案例

### 案例：订单列表查询优化

**原始 SQL（2.3 秒）**：

```sql
SELECT o.*, u.name, u.phone
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE o.status IN ('PAID', 'SHIPPED')
ORDER BY o.create_time DESC
LIMIT 20;
```

**优化步骤**：

```sql
-- 1. EXPLAIN 分析 → type=ALL, rows=200w

-- 2. 添加联合索引
CREATE INDEX idx_status_time ON orders(status, create_time);

-- 3. 改写为覆盖索引 + 延迟关联
SELECT o.*, u.name, u.phone
FROM orders o
JOIN (
    SELECT id FROM orders
    WHERE status IN ('PAID', 'SHIPPED')
    ORDER BY create_time DESC
    LIMIT 20
) tmp ON o.id = tmp.id
LEFT JOIN users u ON o.user_id = u.id;

-- 优化后：0.02 秒（提升 115 倍）
```

## 六、参数调优速查

```ini
# my.cnf 关键参数
[mysqld]
# InnoDB 缓冲池（设为物理内存的 50%-70%）
innodb_buffer_pool_size = 8G

# 日志文件大小
innodb_log_file_size = 512M

# 最大连接数
max_connections = 500

# 查询缓存（MySQL 8.0 已移除，低版本建议关闭）
query_cache_type = 0

# 表打开缓存
table_open_cache = 2000

# 排序缓冲区
sort_buffer_size = 4M

# JOIN 缓冲区
join_buffer_size = 4M
```

## 总结

| 优化层级 | 效果 | 成本 |
|---------|------|------|
| SQL 改写 | 10-100x | 低 |
| 索引优化 | 10-1000x | 低 |
| 架构调整 | 10x+ | 高 |
| 硬件升级 | 2-5x | 中 |

优化顺序：**先 SQL → 再索引 → 最后架构**。90% 的性能问题可以通过前两步解决。
