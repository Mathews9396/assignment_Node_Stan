const { fork } = require("child_process");
const Redis = require("ioredis");
const redis = new Redis();

async function clearRedisQueue(queueName) {
  const queueLength = await redis.llen(queueName);
  console.log("queueLength - ", queueLength);
  if (queueLength > 0) {
    const deletionResponse = await redis.del(queueName);
    console.log(`deletionResponse`, deletionResponse);
  }
}
clearRedisQueue("update_queue");

// Spawn two child processes
const worker1 = fork("./workers/worker1.js");
const worker2 = fork("./workers/worker2.js");

const initWorkers = function () {
  // Handle messages from child processes
  worker1.on("message", (message) => {
    console.log(`Worker 1 sent: ${message}`);
  });

  worker2.on("message", (message) => {
    console.log(`Worker 2 sent: ${message}`);
  });
};

module.exports = { initWorkers };
