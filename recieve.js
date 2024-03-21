const amqpCallback = require("amqplib/callback_api");

const recieveSampleMessage = function () {
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
      console.log(`********* Waiting for messages in ${queue}. To exit press CTRL+C`);

      channel.consume(
        queue,
        function (msg) {
          console.log("1st cosumer - Message Received :\t", msg.content.toString());
        },
        {
          noAck: true,
        }
      );
      channel.consume(
        queue,
        function (msg) {
          console.log("2nd consumer - Message Received :\t", msg.content.toString());
        },
        {
          noAck: true,
        }
      );
    });
  });
};
module.exports = { recieveSampleMessage };
