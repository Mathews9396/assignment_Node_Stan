const redis = require("ioredis");
const client = redis.createClient();

client.on("error", function (err) {
  console.log("Error " + err);
});

// Initialize the shared value
client.set("sharedValue", 0);

// Worker function to increment the shared value
function incrementValue(workerId) {
  setInterval(() => {
    // Simulate a read-modify-write operation
    client.get("sharedValue", (err, value) => {
      if (err) {
        console.error("Error reading value:", err);
      } else {
        const newValue = parseInt(value) + 1;
        console.log(`Worker ${workerId}: Incrementing shared value to ${newValue}`);
        // Simulate a delay between read and write
        setTimeout(() => {
          // Simulate writing the incremented value back to Redis
          client.set("sharedValue", newValue, (err) => {
            if (err) {
              console.error(`Error writing value from worker ${workerId}:`, err);
            }
          });
        }, Math.random() * 1000); // Random delay between 0 to 1000 ms
      }
    });
  }, Math.random() * 2000); // Random interval between 0 to 2000 ms
}

// Create three worker threads
for (let i = 1; i <= 3; i++) {
  incrementValue(i);
}
