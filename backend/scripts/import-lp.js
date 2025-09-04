// 作用：将 Line Protocol 文件批量写入 InfluxDB（支持固定时间戳的幂等导入）
//
// 用法（在仓库根目录执行）：
//   node backend/scripts/import-lp.js [相对或绝对路径，默认 ../data/sample.lp]
//
// 行为：
// - 读取根目录 .env 的 INFLUXDB_URL / ORG / BUCKET / TOKEN（也兼容 INFLUX_URL / ORG / BUCKET / TOKEN；URL 还兼容 INFLUX_HOST）
// - 通过 INFLUXDB_PRECISION / INFLUX_PRECISION 指定写入精度（默认 s = 秒）
// - 逐行写入（忽略空行和以 # 开头的整行注释）
// - 若 LP 行包含“相同 series + 相同时间戳”，重复导入不会增加条数（Influx upsert）
//
// 示例：
//   INFLUX_URL="$INFLUX_HOST" INFLUX_TOKEN="$INFLUX_TOKEN" \
//   INFLUX_ORG="monitoring-observability" INFLUX_BUCKET="mo_system_metrics" \
//   INFLUX_PRECISION="s" node backend/scripts/import-lp.js data/mo_system_metrics.lp

const fs = require('fs');
const path = require('path');
const { InfluxDB } = require('@influxdata/influxdb-client');

// 读取仓库根目录的 .env
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// 环境变量兼容读取
const INFLUX_URL =
  process.env.INFLUXDB_URL ||
  process.env.INFLUX_URL ||
  process.env.INFLUX_HOST; // 兼容你之前导出的 INFLUX_HOST

const INFLUX_ORG =
  process.env.INFLUXDB_ORG ||
  process.env.INFLUX_ORG;

const INFLUX_BUCKET =
  process.env.INFLUXDB_BUCKET ||
  process.env.INFLUX_BUCKET;

const INFLUX_TOKEN =
  process.env.INFLUXDB_TOKEN ||
  process.env.INFLUX_TOKEN;

const INFLUX_PREC =
  process.env.INFLUXDB_PRECISION ||
  process.env.INFLUX_PRECISION ||
  's'; // 默认秒，避免把“秒级时间戳”当成纳秒解析

if (!INFLUX_URL || !INFLUX_ORG || !INFLUX_BUCKET || !INFLUX_TOKEN) {
  console.error('[import-lp] Missing Influx env. Expect URL/ORG/BUCKET/TOKEN.');
  console.error('  Read from .env at repo root and process.env.');
  process.exit(1);
}

// 解析 LP 文件路径
const inputPathArg = process.argv[2] || '../data/sample.lp';
const lpPath = path.resolve(__dirname, inputPathArg);

(async () => {
  try {
    // 文件存在性与类型检查
    if (!fs.existsSync(lpPath)) {
      console.error(`[import-lp] File not found: ${lpPath}`);
      process.exit(1);
    }
    const stat = fs.statSync(lpPath);
    if (!stat.isFile()) {
      console.error(`[import-lp] Not a regular file: ${lpPath}`);
      process.exit(1);
    }

    // 读取与过滤行（忽略空行与以 # 开头的整行注释）
    const text = fs.readFileSync(lpPath, 'utf8');
    const lines = text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('#'));

    if (lines.length === 0) {
      console.log('[import-lp] No data lines after filtering comments/blank lines. Nothing to write.');
      return;
    }

    // 创建写入 API；精度由 INFLUX_PREC 控制：ns/us/ms/s
    const influx = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
    const writeApi = influx.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, INFLUX_PREC);

    // 逐行写入
    for (const line of lines) {
      writeApi.writeRecord(line);
    }

    // 刷新并关闭
    await writeApi.close();

    console.log(`[import-lp] Wrote ${lines.length} line(s) from ${lpPath}`);
    console.log(`[import-lp] -> org="${INFLUX_ORG}", bucket="${INFLUX_BUCKET}", precision="${INFLUX_PREC}" @ ${INFLUX_URL}`);
    console.log('[import-lp] Note: fixed-timestamp records are idempotent (upsert, not duplicate).');
  } catch (err) {
    const msg = err && (err.message || err.toString());
    console.error('[import-lp] error:', msg);
    process.exit(1);
  }
})();
