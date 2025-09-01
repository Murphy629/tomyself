// 作用：将 Line Protocol 文件批量写入 InfluxDB（支持固定时间戳的幂等导入）
//
// 用法：在仓库根目录执行
//   node backend/scripts/import-lp.js [相对或绝对路径，默认 ../data/sample.lp]
//
// 行为：
// - 读取根目录 .env 的 INFLUXDB_URL / ORG / BUCKET / TOKEN
// - 逐行写入（忽略空行和以 # 开头的注释行）
// - 若 LP 行包含“相同 series + 相同时间戳”，重复导入不会增加条数（Influx upsert）

const fs = require('fs');
const path = require('path');
const { InfluxDB } = require('@influxdata/influxdb-client');

//读去根目录
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const INFLUX_URL    = process.env.INFLUXDB_URL || process.env.INFLUX_URL;
const INFLUX_ORG    = process.env.INFLUXDB_ORG || process.env.INFLUX_ORG;
const INFLUX_BUCKET = process.env.INFLUXDB_BUCKET || process.env.INFLUX_BUCKET;
const INFLUX_TOKEN  = process.env.INFLUXDB_TOKEN || process.env.INFLUX_TOKEN;

if (!INFLUX_URL || !INFLUX_ORG || !INFLUX_BUCKET || !INFLUX_TOKEN) {
  console.error('[import-lp] Missing Influx env (URL/ORG/BUCKET/TOKEN). Check .env at repo root.');
  process.exit(1);
}

// LP 文件路径
const inputPathArg = process.argv[2] || '../data/sample.lp';
const lpPath = path.resolve(__dirname, inputPathArg);

(async () => {
  try {
    if (!fs.existsSync(lpPath)) {
      console.error(`[import-lp] File not found: ${lpPath}`);
      process.exit(1);
    }

    // 读取并过滤
    const text = fs.readFileSync(lpPath, 'utf8');
    const lines = text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('#'));

    if (lines.length === 0) {
      console.log('[import-lp] No data lines after filtering comments/blank lines. Nothing to write.');
      return;
    }

    const influx = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
    const writeApi = influx.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, 'ns');

    for (const line of lines) {
      writeApi.writeRecord(line);
    }
    await writeApi.close();

    console.log(`[import-lp] Wrote ${lines.length} line(s) from ${lpPath}`);
    console.log(`[import-lp] -> org="${INFLUX_ORG}", bucket="${INFLUX_BUCKET}" @ ${INFLUX_URL}`);
    console.log('[import-lp] Note: fixed-timestamp records are idempotent (upsert, not duplicate).');
  } catch (err) {
    console.error('[import-lp] error:', err?.message || err);
    process.exit(1);
  }
})();
