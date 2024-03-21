const Redis = require("ioredis");
const amqp = require("amqplib");
const redis = new Redis();
const amqpCallback = require("amqplib/callback_api");

let channel;
const rabbitQueue = "counterUpdate";

async function incrementCounter() {
  let newValue;
  // await redis.incr("counter");
  redis.get("counter", (err, value) => {
    if (err) {
      console.error("Error reading value:", err);
    } else {
      // console.log(`Worker 3: Value of shared resource before updating ${parseInt(value)}`);
      newValue = parseInt(value) + 1;
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
          console.log("Worker 3: Message Received :\t", newValue);
          newValue += 1;
          console.log("Worker 3: newValue - ", newValue);
        },
        {
          noAck: true,
        }
      );
      const intervalId = setInterval(() => {
        // Simulate a delay between read and write
        setTimeout(() => {
          // Simulate writing the incremented value back to Redis

          console.log(`Worker 3: Incrementing shared value of counter to ${newValue}`);

          redis.set("counter", newValue, (err) => {
            if (err) {
              console.error(`Error writing value from worker 3:`, err);
            }

            channel.sendToQueue(rabbitQueue, Buffer.from(String(newValue)));

            console.log("Worker 3: New Counter value Sent : ", newValue);

            if (newValue > 10) {
              clearInterval(intervalId);
              console.log(`Closing rabbit mq connection`);
              connection.close();
              return;
            }
          });
        }, Math.random() * 1000); // Random delay between 0 to 1000 ms
      }, Math.random() * 2000); // Random interval between 0 to 2000 ms
    });
  });
}

async function start() {
  await incrementCounter();
}

start();
