const Redis = require("ioredis");
const redis = new Redis();
const amqpCallback = require("amqplib/callback_api");

const rabbitQueue = "counterUpdate";
const redisFIFOQueue = "update_queue";

async function incrementCounter() {
  let newValue;
  redis.get("counter", (err, value) => {
    if (err) {
      console.error("Error reading value:", err);
    } else {
      console.log(`Worker 1: Value of shared resource before updating ${parseInt(value)}`);
      // newValue = parseInt(value) + 1;
    }
  });

  amqpCallback.connect("amqp://localhost", function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }

      channel.assertQueue(rabbitQueue, {
        durable: false,
      });
      channel.consume(
        rabbitQueue,
        function (msg) {
          newValue = parseInt(msg.content.toString());
          console.log("Worker 1: Message Received :\t", newValue);
        },
        {
          noAck: true,
        }
      );

      const intervalId = setInterval(async () => {
        const incrementedValue = await redis.incr("counter");
        if (incrementedValue <= 10) {
          channel.sendToQueue(rabbitQueue, Buffer.from(String(incrementedValue)));
          await redis.lpush(redisFIFOQueue, incrementedValue);
        } else {
          clearInterval(intervalId);
          console.log(`Worker 1: Closing rabbit mq connection`);
          const queueLength = await redis.llen(redisFIFOQueue);
          const queueData = await redis.lrange(redisFIFOQueue, 0, queueLength);
          console.log(queueData);
          connection.close();
          return;
        }
      }, Math.random() * 2000); // Random interval between 0 to 2000 ms
    });
  });
}

async function start() {
  await incrementCounter();
}

start();
