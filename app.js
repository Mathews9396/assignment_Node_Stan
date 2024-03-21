const amqp = require("amqplib");

const Redis = require("ioredis");
const redis = new Redis();
const redisFIFOQueue = "update_queue";

async function init() {
  await clearRedisQueue(redisFIFOQueue);

  await redis.set("counter", 0);
  const counterValue = await redis.get("counter");
  console.log("counterValue - ", counterValue);
}
init();

const { initWorkers } = require("./workerSup");
initWorkers();

async function clearRedisQueue(queueName) {
  const queueLength = await redis.llen(queueName);
  console.log("queueLength - ", queueLength);
  if (queueLength > 0) {
    const deletionResponse = await redis.del(queueName);
    console.log(`deletionResponse`, deletionResponse);
  }
}
