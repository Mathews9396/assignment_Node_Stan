const amqpCallback = require("amqplib/callback_api");

const sendSampleMessage = function () {
  amqpCallback.connect("amqp://localhost", function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      var queue = "hello";

      channel.assertQueue(queue, {
        durable: false,
      });

      setInterval(() => {
        var msg = "Hello world" + Math.random() * 100;

        channel.sendToQueue(queue, Buffer.from(msg));
        console.log(" \n\nMessage Sent : ", msg);
      }, Math.random() * 1000);
    });

    setTimeout(function () {
      console.log(`Closing connection`);
      connection.close();
      process.exit(0);
    }, 20000);
  });
};

module.exports = { sendSampleMessage };
